import boto3 
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('obituary_30147402')

def handler(event, context):
    try:
        response = table.scan()

        if response["Count"] == 0:
            return {
                "statusCode": 200, 
                "body": json.dumps({"message": "empty table", "data": []})
            }
        
        return {
            "statusCode": 200,
            "body": json.dumps(response['Items'])
        }
    
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body":json.dumps({'message':str(e)})
    }