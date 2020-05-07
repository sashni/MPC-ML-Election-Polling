
## MPC Logistic Regression Implementation
## Requirements
Run ``` npm install ``` to install dependencies.
## Running Demo
1. Running a server:
    ```shell
    node log_regression/server.js
    ```

2. Open 3 node.js parties by running
    ```shell
   node <path-to-file> <data-file> <party-count>:
   
    node log_regression/party.js training_data1.json 3
   
   node log_regression/party.js training_data2.json 3
   
   node log_regression/party.js training_data3.json 3

Each training_data.json file consists of training data, testing data and proportions.

Output:<br>
W = [w1, w2] : computed weights of the prediction function

