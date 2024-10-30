# especifico version de node
FROM node:20.8.0
# corro comando para crear carpeta App dentro de /usr/src (-p crea las carpetas anteriores en caso de no existir)
RUN mkdir -p /usr/src/app
# me muevo a la carpeta creada
WORKDIR /usr/src/app
#  copio todos los archivos que contengan package y terminen en .json en el directorio actual
COPY ./package*.json ./
# instalo los paquetes
RUN npm install
# copio el directorio dentro de el contenedor
COPY . .
# referencio el puerto donde se ejecuta
EXPOSE 3000
# comando para iniciar
CMD [ "npm", "run", "dev" ]

# RUN rebuild esbuild


# para ejecutar el contenedor se debe correr el comando "docker build -t hellonode ."