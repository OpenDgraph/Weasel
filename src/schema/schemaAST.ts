import { parse, validateSchema, buildSchema } from 'graphql';
import fs from 'fs';

const schemaString = fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8');
const baseSchema = fs.readFileSync(__dirname.concat('/schema_base.graphql'), 'utf8');
const parsedSchema = parse(schemaString);

let globalQueriesSingular = '';
let globalQueriesplural = '';
let addGlobalMutations = '';
let updateGlobalMutations = '';
let deleteGlobalMutations = '';

const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID'];

const generateEnumDefinition = (definition: any) => {
	return `enum ${definition.name.value} {\n  ${definition.values
		.map((value: any) => value.name.value)
		.join('\n  ')}\n}\n\n`;
};
const resolveType = (fieldType: any): string => {
	switch (fieldType.kind) {
		case 'NamedType':
			return fieldType.name.value;
		case 'ListType':
			return `[${resolveType(fieldType.type)}]`;
		case 'NonNullType':
			return `${resolveType(fieldType.type)}!`;
		default:
			return 'UnknownType';
	}
};

const generateFieldDefinition = (field: any) => {
	const fieldType = resolveType(field.type);
	return `  ${field.name.value}: ${fieldType}`;
};

const generateObjectTypeDefinition = (definition: any, generateOperations = false) => {
	let objectType = `type ${definition.name.value} {\n${definition.fields
		.map(generateFieldDefinition)
		.join('\n')}\n}\n\n`;

	if (generateOperations) {
		objectType += generateOperationsFromAST(definition);
	}

	return objectType;
};

const generateInputFieldDefinition = (field: any) => {
	const fieldName = field.name.value;
	let fieldType = resolveType(field.type);

	if (fieldType.includes('[') || !scalarTypes.includes(fieldType)) {
		fieldType = 'ID';
	}

	return `  ${fieldName}: ${fieldType.replace('!', '')}`; // make all fields optional
};

const generateInputTypeDefinition = (definition: any) => {
	const seenFields = new Set<string>();
	const fields: any = [];

	definition.fields.forEach((field: any) => {
		const fieldName = field.name.value;

		// Check duplicate fields
		if (seenFields.has(fieldName)) {
			return;
		}

		seenFields.add(fieldName);
		fields.push(generateInputFieldDefinition(field));
	});

	return `input ${definition.name.value}Input {\n${fields.join('\n')}\n}\n\n`;
};

const generateOperationsFromAST = (astNode: any): string => {
	if (astNode.kind !== 'ObjectTypeDefinition') {
		return '';
	}

	const typeName = astNode.name.value;
	const inputTypeName = `${typeName}Input`;

	const singular = 'get' + typeName;
	const plural = 'query' + typeName + 's';

	// Gerar Query Types
	globalQueriesSingular += `  ${singular}(id: ID!): ${typeName}\n`;
	globalQueriesplural += `  ${plural}: [${typeName}]\n`;

	// Gerar Mutation Types
	addGlobalMutations += `  add${typeName}(input: ${inputTypeName}): ${typeName}\n`;
	updateGlobalMutations += `  update${typeName}(id: ID!, input: ${inputTypeName}): ${typeName}\n`;
	deleteGlobalMutations += `  delete${typeName}(id: ID!): ${typeName}\n`;

	return '';
};

const reconstructGraphQLSchema = (definitions: any) => {
	let schema = '';
	const seenTypes = new Set<string>();

	definitions.forEach((definition: any) => {
		const typeName = definition?.name?.value;

		if (['Query', 'Mutation', 'Schema', 'Subscription'].includes(typeName)) {
			return;
		}

		if (typeName.charAt(0).toLowerCase() === typeName.charAt(0)) {
			throw new Error(`The type name '${typeName}' should start with an uppercase letter.`);
		}

		if (seenTypes.has(typeName)) {
			throw new Error(`Duplicate type detected: '${typeName}'`);
		} else {
			seenTypes.add(typeName);
		}

		switch (definition.kind) {
			case 'EnumTypeDefinition':
				schema += generateEnumDefinition(definition);
				break;
			case 'ObjectTypeDefinition':
				schema += generateObjectTypeDefinition(definition, true);
				schema += generateInputTypeDefinition(definition);
				break;
			default:
				break;
		}
	});
	schema += `type Aggregate {\n aggregateOn: String \n}\n\n`;
	schema += `type Get {\n${globalQueriesSingular}}\n\n`;
	schema += `type Query {\n${globalQueriesplural}}\n\n`;
	schema += `type AddMutation {\n${addGlobalMutations}}\n\n`;
	schema += `type UpdateMutation {\n${updateGlobalMutations}}\n\n`;
	schema += `type DeleteMutation {\n${deleteGlobalMutations}}\n\n`;
	return schema;
};

const reconstructedSchema = reconstructGraphQLSchema(parsedSchema.definitions);

function getObjectKeys(obj: { [key: string]: any }): string[] {
	return Object.keys(obj);
}

const schemaDefinition = (): any => {
	// console.log(reconstructedSchema);
	const mySchema = buildSchema(reconstructedSchema);

	const errors = validateSchema(mySchema);
	if (errors.length > 0) {
		console.error(errors);
	} else {
		const queryType = mySchema.getQueryType();
		const mutationType = mySchema.getMutationType();
		let queryNames = {};
		let mutationNames = {};

		// @ts-ignore: Object is possibly 'null'.
		const Get = mySchema.getTypeMap().Get._fields;
		// @ts-ignore: Object is possibly 'null'.
		const Aggregate = mySchema.getTypeMap().Aggregate._fields;
		// @ts-ignore: Object is possibly 'null'.
		const queryFields = queryType.getFields();

		queryNames = [
			...getObjectKeys(Get),
			...getObjectKeys(Aggregate),
			...Object.keys(queryFields)
		];

		// @ts-ignore: Object is possibly 'null'.
		const AddMutation = mySchema.getTypeMap().AddMutation._fields;
		// @ts-ignore: Object is possibly 'null'.
		const UpdateMutation = mySchema.getTypeMap().UpdateMutation._fields;
		// @ts-ignore: Object is possibly 'null'.
		const DeleteMutation = mySchema.getTypeMap().DeleteMutation._fields;
		// @ts-ignore: Object is possibly 'null'.
		const mutationFields = mutationType?.getFields();
		
		mutationNames = [
			...Object.keys(mutationFields||{}),
			...getObjectKeys(AddMutation),
			...getObjectKeys(UpdateMutation),
			...getObjectKeys(DeleteMutation)
		];

		return [`${baseSchema} ${reconstructedSchema}`, [queryNames, mutationNames]];
	}
};

export default schemaDefinition;
