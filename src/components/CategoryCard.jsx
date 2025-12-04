// Component - Category Card
import { useNavigate } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(category.id);
        } else {
            navigate(`/?category=${category.id}`);
        }
    };

    return (
        <div className="category-card" onClick={handleClick}>
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-title">{category.title}</h3>
        </div>
    );
};

export default CategoryCard;
