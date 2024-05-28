## run.sh
```
#!/bin/bash

mysql -u root -p < database/schema.sql

cd backend


export FLASK_APP=app.py
export FLASK_ENV=development
flask run &

cd ../frontend
npm install

npm start
```

## Use Case Diagram
![voting_use_case drawio](https://github.com/RybOlya/sw_doc_design_project/assets/91027975/00bc42d8-9fe7-49d1-bcf6-75024f087721)
## Class Diagram
![voting_class drawio (2)](https://github.com/RybOlya/sw_doc_design_project/assets/91027975/7191ffe4-e07c-427c-a634-c41350c8c001)
