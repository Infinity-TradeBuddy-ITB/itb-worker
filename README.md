# papaya-trade

## este projeto usa `node 18.14.0` and `pnpm 7.27.0`

# abaixa informações sobre como devem ser os commits e nomes de branchs

### <tag_da_historia>_descricao

### para nome de branch /\

### <[tag_da_tarefe]> descricao

### para nome de commit /\

# abaixa informações sobre o docker

## primeiro crie o volume a ser usado pelo container
- `$ docker volume create mongodb-data`

## execute o comando para criar o container usando o volume
- `$ docker run -d --name mongodb -v mongodb-data:/data/db -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=toor -e MONGO_INITDB_DATABASE=itb_db mongo:6.0.4`

## comando para acessar o container 
- `$ docker exec -it mongodb mongo -u admin -p secret`
-`$ docker exec -it mongodb mongo -u root -p toor --authenticationDatabase=itb_db`

## comando para parar o container 
- `$ docker stop mongodb`

## comando para iniciar o container
- `$ docker start mongodb`


# [https://www.vectorstock.com/royalty-free-vectors/pattern-formation-vector-image-vectors-by_bestforbest] (Trading Patterns)
