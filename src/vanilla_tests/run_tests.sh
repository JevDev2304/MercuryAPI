#!/bin/bash
for file in test.user.ts test.song.ts test.auth.ts; do 
  start=$(date +%s)
  npx ts-node "$file"
  end=$(date +%s)
  echo "$file tardó $((end - start))s"
done
