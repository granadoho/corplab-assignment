import '@testing-library/jest-dom'
import { render, screen, act, within, fireEvent } from "@testing-library/react"
import Table from "../components/Table"
import fetchMock from 'jest-fetch-mock';
import { createMemoryHistory } from "history";

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
        render(<Table />);
    });

    // Wait for the data to be loaded
    const table = await screen.findByRole('table');

    // Assert that the table has 10 rows
    const rows = within(table).getAllByRole('row').slice(1); // Skip header row
    expect(rows).toHaveLength(10);
});

test("Renders table with 20 rows", async () => {
    // Mock the fetch call with a sample response
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    await act(async () => {
        render(<Table />);
    });

    // Wait for the data to be loaded
    const table = await screen.findByRole('table');

    // Change the value of rowsPerPage to 20
    const rowsPerPageInput = screen.getByPlaceholderText('Rows');
    fireEvent.change(rowsPerPageInput, { target: { value: '20' } });

    // Wait for the table to update with 20 rows
    const updatedTable = await screen.findByRole('table');

    // Assert that the updated table has 20 rows
    const updatedRows = within(updatedTable).getAllByRole('row').slice(1); // Skip header row
    expect(updatedRows).toHaveLength(20);
});

test("Renders table and search for BMW in Brand column", async () => {
    // Mock the fetch call with a sample response
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    await act(async () => {
        render(<Table />);
    });

    // Wait for the data to be loaded
    const table = await screen.findByRole('table');

    // Change the column to Brand and value to BMW
    const columnToSearch = screen.getByTestId('searchColumn');
    fireEvent.change(columnToSearch, { target: { value: 'brand' } });

    const nameToSearch = screen.getByPlaceholderText('What do you want to search');
    fireEvent.change(nameToSearch, { target: { value: 'BMW' } });

    // Wait for the table to update
    const updatedTable = await screen.findByRole('table');

    // Assert that the updated table has 10 rows
    const updatedRows = within(updatedTable).getAllByRole('row').slice(1); // Skip header row
    expect(updatedRows).toHaveLength(10);

    // Assert that the "Brand" column shows 'BMW' for all rows
    updatedRows.forEach((row) => {
        const brandColumn = within(row).getByText('BMW', { exact: false });
        expect(brandColumn).toBeInTheDocument();
    });
});

// Helper function to update location
const navigateTo = (url: string) => {
    history.push(url);
};

// Mock history for testing React Router
const history = createMemoryHistory();

test("Renders table, search for BMW in Brand column and generate link", async () => {
    // Mock the fetch call with a sample response
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    await act(async () => {
        render(<Table />);
    });

    // Wait for the data to be loaded
    const table = await screen.findByRole('table');

    // Change the column to Brand and value to BMW
    const columnToSearch = screen.getByTestId('searchColumn');
    fireEvent.change(columnToSearch, { target: { value: 'brand' } });

    const nameToSearch = screen.getByPlaceholderText('What do you want to search');
    fireEvent.change(nameToSearch, { target: { value: 'BMW' } });

    // Wait for the table to update
    const updatedTable = await screen.findByRole('table');

    // Generate the shareable link
    const generateLinkButton = screen.getByTestId("generateButton");
    fireEvent.click(generateLinkButton);

    // Retrieve the link using data-testid
    const shareableLink = screen.getByTestId('link').getAttribute('href') ?? '';

    // Simulate a click on the generated link
    act(() => {
        navigateTo(shareableLink);
    });

    // Wait for the table to update
    const expectedTable = await screen.findByRole('table');

    // Assert that the table has the expected results
    const updatedRows = within(updatedTable).getAllByRole('row').slice(1);
    const expectedRows = within(expectedTable).getAllByRole('row').slice(1);

    // Compare each row in the updated table with the expected table
    updatedRows.forEach((row, index) => {
        const brandColumn = within(row).getByText('BMW', { exact: false });
        const expectedBrandColumn = within(expectedRows[index]).getByText('BMW', { exact: false });

        expect(brandColumn).toBeInTheDocument();
        expect(expectedBrandColumn).toBeInTheDocument();
    });
});
