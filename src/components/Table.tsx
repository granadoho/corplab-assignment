import React, { useState, useEffect } from 'react'

interface RowData {
    id: string
    isInProduction: string
    brand: string
    model: string
    color: string
    createdAt: string
    updatedAt: string
}

const Table = () => {

    const [data, setData] = useState<RowData[]>([])
    const [searchColumn, setSearchColumn] = useState<string>('');
    const [searchValue, setSearchValue] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [shareableLink, setShareableLink] = useState<string>('');
    

    const totalRows: number = data.length
    const totalPages: number = Math.ceil(totalRows / rowsPerPage)

    // Function to handle page navigation
    const handlePageChange = (newPage: number): void => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            console.log(newPage);
        }
    }

    // Function to apply search filter
    const applySearchFilter = (
        rows: RowData[],
        column: string,
        value: string,
    ): RowData[] => {
        if (!column || !value) {
            return rows
        }

        return rows.filter(
            (row) =>
            (String(row[column as keyof RowData]) as string)
                .toLowerCase()
                .includes(value.toLowerCase()),
        )
    }

    // Function to handle column sorting
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // If clicking on the same column, toggle the sort order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking on a different column, set the new column and default to ascending order
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    // Function to get the current page data
    const getCurrentPageData = (): RowData[] => {
        const startIndex: number = (currentPage - 1) * rowsPerPage
        const endIndex: number = startIndex + rowsPerPage
        const filteredData = applySearchFilter(data, searchColumn, searchValue)
        

        // Apply sorting
        const sortedData = sortColumn
            ? [...filteredData].sort((a, b) => {
                const aValue = a[sortColumn as keyof RowData].toLowerCase();
                const bValue = b[sortColumn as keyof RowData].toLowerCase();

                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            })
            : filteredData;

        return sortedData.slice(startIndex, endIndex);
    }

    // Function to generate shareable link
    const generateShareableLink = () => {
        const queryParams = new URLSearchParams();

        queryParams.set('searchColumn', searchColumn);
        queryParams.set('searchValue', searchValue);
        queryParams.set('currentPage', currentPage.toString());
        queryParams.set('rowsPerPage', rowsPerPage.toString());
        queryParams.set('sortColumn', sortColumn || '');
        queryParams.set('sortOrder', sortOrder);

        setShareableLink(`${window.location.href.split('?')[0]}?${queryParams.toString()}`);

        // You can copy the link to the clipboard, open a modal, or do anything else here
    };


    const parseUrlParameters = () => {
        const params = new URLSearchParams(location.search);

        setSearchColumn(params.get('searchColumn') || '');
        setSearchValue(params.get('searchValue') || '');
        setCurrentPage(parseInt(params.get('currentPage') || '1', 10));
        setRowsPerPage(parseInt(params.get('rowsPerPage') || '10', 10));
        setSortColumn(params.get('sortColumn') || null);
        setSortOrder((params.get('sortOrder') as 'asc' | 'desc') || 'asc');
    };

    useEffect(() => {
        // Fetch data from cars.json
        fetch('/cars.json') // Update the path accordingly
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                };
                return response.json();
            })
            .then((jsonData) => {
                const dataWithStrings = jsonData.map((item: RowData) => ({
                    ...item,
                    isInProduction: item.isInProduction.toString(),
                }));
                setData(dataWithStrings);

                // Parse URL parameters on component mount
                parseUrlParameters();
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [location.search]);

    // Render conditionally based on data availability
    if (!data || data.length === 0) {
        // Data is not available yet, or it's empty
        return <div>Loading...</div>; // You can customize the loading indicator
    }

    return (
        <div className="flex flex-col w-full justify-center p-1">

            {/* ---------- Dropdown Filter & Search Box ---------- */}

            {/* Filtered feature based on column for mobile and tablet */}
            <div className="flex lg:hidden w-full justify-end items-center pl-5 pr-5 pt-5">
                <select
                id="searchColumn"
                className="py-2 px-5 w-full h-9 bg-white bg-opacity-20 rounded-2xl shadow text-white text-xs"
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                >
                    <option value="">Select Column To Search</option>
                    <option value="isInProduction">Is In Production</option>
                    <option value="brand">Brand</option>
                    <option value="model">Model</option>
                    <option value="color">Color</option>
                    <option value="createdAt">Created At</option>
                </select>
            </div>

            
            <div className="flex flex-row w-full justify-end items-center p-5 gap-5">
                {/* Filtered feature based on column for desktop */}
                <select
                id="searchColumn"
                className="hidden lg:flex py-2 px-5 w-[13rem] h-9 bg-white bg-opacity-20 rounded-2xl shadow text-white text-xs"
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                >
                    <option value="">Select Column To Search</option>
                    <option value="isInProduction">Is In Production</option>
                    <option value="brand">Brand</option>
                    <option value="model">Model</option>
                    <option value="color">Color</option>
                    <option value="createdAt">Created At</option>
                </select>
                
                {/* Search box based on filter selection */}
                <input
                    className="w-full lg:w-[25rem] h-9 py-2 px-5 bg-white bg-opacity-20 rounded-2xl text-center text-white placeholder-white text-xs"
                    type="text"
                    id="searchValue"
                    placeholder="What do you want to search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>


            {/* ---------- Table ---------- */}
            <div className="flex flex-row w-full justify-start items-center p-5 gap-5 rounded-2xl overflow-x-auto">
                <table className="w-full bg-white bg-opacity-20 border border-white rounded-xl text-xs text-left truncate">
                    <thead className='text-white'>
                        <tr>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('id')}
                            >
                                Id
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('isInProduction')}
                            >
                                Is In Production
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('brand')}
                            >
                                Brand
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('model')}
                            >
                                Model
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('color')}
                            >
                                Color
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('createdAt')}
                            >
                                Created At
                            </th>
                            <th
                                className="p-2 border-b cursor-pointer truncate"
                                onClick={() => handleSort('updatedAt')}
                            >
                                Updated At
                            </th>

                        </tr>
                    </thead>
                    <tbody className='text-slate-200'>
                        {getCurrentPageData().map((row) => (
                            <tr key={row.id}>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.id}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.isInProduction}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.brand}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.model}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.color}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.createdAt}</td>
                                <td className="p-2 border-b max-w-[8rem] truncate">{row.updatedAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col lg:flex-row w-full justify-center lg:justify-between items-center p-5 ">

                {/* Generate link button for desktop */}
                <div className="hidden lg:flex w-[25rem] h-9 bg-white bg-opacity-20 border rounded-2xl cursor-pointer justify-center items-center">
                    <button 
                        className="w-full text-sm justify-center items-center text-center font-bold text-white"
                        onClick={generateShareableLink}
                    >
                        Share what you're seeing
                    </button>
                </div>



                <div className="flex flex-row justify-stretch items-center gap-5">
                    {/* Previous page button */}
                    <div className="flex w-[5rem] h-9 bg-white bg-opacity-20 rounded-2xl cursor-pointer text-center justify-center items-center">
                        <button
                            className="w-full text-xs text-center justify-center items-center"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                    </div>

                    <input
                        className="border m-2 py-2 px-5 w-[5rem] h-9 rounded-lg shadow"
                        type="number"
                        placeholder="Rows"
                        name="rowsPerPage"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    />

                    {/* Next page button */}
                    <div className="flex w-[5rem] h-9 bg-white bg-opacity-20 rounded-2xl cursor-pointer text-center justify-center items-center">
                        <button
                            className="w-full text-xs text-center justify-center items-center"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                    
                </div>

                <span className="text-white text-xs">
                    Total of {totalRows} {totalRows === 1 ? 'row' : 'rows'}
                </span>


                {/* Generate link button for mobile or tablet */}
                <div className="flex lg:hidden w-[13rem] h-9 bg-white bg-opacity-20 border rounded-2xl cursor-pointer justify-center items-center m-3">
                    <button 
                        className="w-full text-sm justify-center items-center text-center font-bold text-white"
                        onClick={generateShareableLink}
                    >
                        Share what you're seeing
                    </button>
                </div>
            </div>

            {shareableLink !== '' ? (
                <div className="flex flex-row w-full justify-start p-5 text-blue-400 text-sm truncate">
                    <a href={shareableLink}>
                        Generated Link: {shareableLink}
                     </a>
                </div>
            ) : null}

            
            
        </div>
    )
}

export default Table
