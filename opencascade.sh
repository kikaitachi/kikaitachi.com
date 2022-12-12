docker run \
  --rm \
  -it \
  -v "$(pwd):/src" \
  -u "$(id -u):$(id -g)" \
  donalffons/opencascade.js \
  opencascade.yml
rm opencascade.d.ts
