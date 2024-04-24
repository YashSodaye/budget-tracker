// Put your code below this line.

import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import { listExpenses } from "./graphql/queries";
import {
  createExpense as createExpenseMutation,
  deleteExpense as deleteExpenseMutation,
} from "./graphql/mutations";

const client = generateClient();

const App = ({ signOut }) => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const apiData = await client.graphql({ query: listExpenses });
    const expensesFromAPI = apiData.data.listExpenses.items;
    setExpenses(expensesFromAPI);
  }

  async function addExpense(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      amount: parseFloat(form.get("amount")),
    };
    await client.graphql({
      query: createExpenseMutation,
      variables: { input: data },
    });
    fetchExpenses();
    event.target.reset();
  }

  async function deleteExpense({ id }) {
    const newExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(newExpenses);
    await client.graphql({
      query: deleteExpenseMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>Budget Tracker</Heading>
      <View as="form" margin="3rem 0" onSubmit={addExpense}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Expense Name"
            label="Expense Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="amount"
            type="number"
            placeholder="Expense Amount"
            label="Expense Amount"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Add Expense
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Expense List</Heading>
      <View margin="3rem 0">
        {expenses.map((expense, index) => (
          <Flex
            key={index}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {expense.name}
            </Text>
            <Text as="span">Amount: ${expense.amount}</Text>
            <Button variation="link" onClick={() => deleteExpense(expense)}>
              Delete Expense
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
