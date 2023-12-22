import '@testing-library/jest-dom'
import { render, screen, act, within } from "@testing-library/react"
import App from "../App"
import fetchMock from 'jest-fetch-mock';


beforeEach(() => {
    // Enable fetch mocking
    fetchMock.enableMocks();
});
  
afterEach(() => {
    // Disable fetch mocking after each test
    fetchMock.mockReset();
});

// Read the actual data from the cars.json file
const mockData = require("../../public/cars.json");
  
test("Renders table with 10 rows", async () => {
    // Mock the fetch call with a sample response
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    await act(async () => {
        render(<App />);
    });

    // Wait for the data to be loaded
    const table = await screen.findByRole('table');

    // Assert that the table has 10 rows
    const rows = within(table).getAllByRole('row').slice(1); // Skip header row
    expect(rows).toHaveLength(10);
});