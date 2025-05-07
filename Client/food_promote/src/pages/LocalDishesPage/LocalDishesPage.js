import React, { useState, useEffect, useContext } from "react";
import classes from './LocalDishesPage.module.css'
import Feature_img from "../../assets/feature.png";
import CategorySlide from '../../components/page/LocalDishesPage/Category/CategorySlide';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import FoodList from '../../components/page/LocalDishesPage/Food/FoodList';
import { useSearchParams } from "react-router-dom";
import { ProductAPI } from '../../apis/productAPI';
import Pagination from "../../components/common/Pagination/Pagination";
import FoodItem from "../../components/page/LocalDishesPage/Food/FoodItem";
import { LoaderContext } from "../../hook/LoaderContext";
import ListEmtry from "../../components/common/error/ListEmtry";

export default function LocalDishesPage() {
    const { setLoading } = useContext(LoaderContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const q = searchParams.get("q") || "";
        const page = Number(searchParams.get("page")) || 1;

        setKeyword(q);
        setCurrentPage(page);

        if (q.trim() !== "") {
            setLoading(true)
            ProductAPI.searchProduct(q, page, (err, data) => {
                if (!err) {
                    setProducts(data.products);
                    setTotalPages(data.totalPages);
                }
                setLoading(false)
            });
        } else {
            setProducts([]);
        }
    }, [searchParams]);

    const handleSearch = (kw) => {
        setSearchParams({ q: kw, page: 1 });
    };

    const handlePageChange = (page) => {
        setSearchParams({ q: keyword, page });
    };
    return (
        <div className={`grid wide ${classes.container}`}>
            <div className={classes.header}>
                <img src={Feature_img} alt="feature" />
                <div>
                    <h1 >
                        Món ăn địa phương đặc sắc
                    </h1>
                    <p>
                        Khám phá hương vị đặc trưng của vùng đất chúng tôi. Từ ẩm thực đường phố đến các món ăn truyền thống tinh tế.
                    </p>
                    <SearchBar defaultValue={keyword} onSearch={handleSearch} />
                </div>
            </div>
            <div className={classes.container}>
                <h1 className={classes.title}>
                    Chọn danh mục
                </h1>
                <CategorySlide />

                {
                    keyword.trim() !== "" &&
                    (products.length > 0 ? <>
                        <h1 className={classes.title}>
                            Kết quả tìm kiếm cho "{keyword}"
                        </h1>
                        <div className={classes.search_list}>
                            {products.map((product) => (
                                <FoodItem key={product._id} data={product} />
                            ))}
                        </div>
                        {
                            totalPages > 1 &&
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange} />
                        }
                    </> :
                        <ListEmtry error={`Not found results for: "${keyword}"`} />)
                }

                <h1 className={classes.title}>
                    Danh sách món ăn địa phương
                </h1>
                <FoodList />

            </div>
        </div>
    )
}
