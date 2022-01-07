# Onboard Marco Prado

## Project's Description
This is my back-end onboard project for Taqtile

## Environment and Tools
This project was developed in Visual Studio Code v1.63.2, using Node v14.12.0, TypeScript v4.5.4, Apollo Server v3.6.1, GraphQL v16.2.0 and PostgreSQL v11.2

## Steps to Run and Debug
### Installing Dependencies
Run `npm install`

### Running the Databases
Run `docker-compose up -d`

### Starting the Server
Run `npm run dev`

### Testing the Server
Open `http://localhost:4000/graphql`
Run the following query:
```
query TestHello{
  hello
}
```

Expected return:
```
{
  "data": {
    "hello": "Hello, world!"
  }
}
```

You can check if data was correctly inserted in the database using TablePlus or other similar apps