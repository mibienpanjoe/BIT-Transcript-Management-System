import PropTypes from 'prop-types';

const Table = ({ columns, data, actions, keyField = '_id' }) => {
    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    {actions && (
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row) => (
                                        <tr key={row[keyField]} className="hover:bg-gray-50 transition-colors">
                                            {columns.map((col) => (
                                                <td key={`${row[keyField]}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                </td>
                                            ))}
                                            {actions && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {actions(row)}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func,
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    actions: PropTypes.func,
    keyField: PropTypes.string,
};

export default Table;
