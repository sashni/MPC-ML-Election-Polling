
## Logistic Regression
## Running Demo
1. Running a server:
    ```shell
    node demos/log_regression/server.js
    ```

2. Open 3 node.js parties by running
    ```shell
    node demos/log_regression/party.js training_data1.json
   
   node demos/log_regression/party.js training_data2.json
   
   node demos/log_regression/party.js training_data3.json

Each training_data.json file consists of X_training data, bag_train data and proportions.
   
## File structure
The demo consists of the following parts:
1. Server script: *server.js*
2. Web Based Party: Made from the following files:
    * *client.html*: UI for the browser.
    * *client.js*: Handlers for UI buttons and input validations.
3. Node.js-Based Party:
    * *party.js*: Main entry point. Parses input from the command line and initializes the computation.
4. The MPC protocol: Implemented in *mpc.js*. This file is used in both the browser and node.js versions of the demo.
5. test.js: mocha unit tests.
6. Documentation:
    * This *README.md* file.

