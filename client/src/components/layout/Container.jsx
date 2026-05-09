/**
 * Container — Max-width content container with responsive padding.
 */
export default function Container({ children, className = '', as: Tag = 'div' }) {
    return (
        <Tag className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </Tag>
    )
}
