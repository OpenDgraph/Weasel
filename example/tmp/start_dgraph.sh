#!/bin/bash

# Inicia dgraph zero
dgraph zero &
zero_pid=$!

# Inicia dgraph alpha
dgraph alpha --security "whitelist=0.0.0.0/0" &
alpha_pid=$!

# Captura sinais de saída e mata os processos
trap "kill $zero_pid $alpha_pid" EXIT

# Espera os processos filhos
wait

#chmod +x start_dgraph.sh