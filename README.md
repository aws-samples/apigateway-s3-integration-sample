# APIGateway S3 integration sample

This sample shows how to integrate APIGateway with S3 bucket. 

### Prerequisite
* You should run the commands on the terminal with node.js and npm installed.

### How to deploy

1. install npm dependency

```
$npm install 
```

2. build the Typescript

```
$npm run build
```

3. deploy the environment. Please confirm the output shown on the terminal. This is the APIgateway endpoint.

```
$npm run deploy
,,,,
,,,
,,
S3APIGWStack.RestApiEndpoint2FBB443B = https://xxxxxxx.execute-api.ap-northeast-1.amazonaws.com/api/
```

4. access the API URL using your favorite web browser

`
https://xxxxxxx.execute-api.ap-northeast-1.amazonaws.com/api/static/index.html
`

You should be able to see the "Content" on the gray background.
