#!/bin/bash

# Se déplacer dans le répertoire parent
cd "$(dirname "$0")/.." || exit 1

# Initialiser une variable pour suivre l'état des tests
all_tests_passed=true

# Parcourir les sous-répertoires
for dir in */; do
  if [ -f "$dir/package.json" ]; then
    if grep -q '"test":' "$dir/package.json"; then
      npm install --prefix "$dir" --silent
      if npm run --prefix "$dir" test -- --silent; then
        echo ""
      else
        echo "Tests failed in $dir"
        all_tests_passed=false
      fi
    fi
  fi
done

# Retourner 1 si un test a échoué, sinon 0
if [ "$all_tests_passed" = false ]; then
  exit 1
else
  exit 0
fi
