import React, { useEffect, useState, useContext } from 'react'
import classes from './DiningPlace.module.css'
// import Geocode from '../../components/page/DiningPlace/Geocode'
import Dining_img from "../../assets/dining.png";
import SearchBar from '../../components/common/SearchBar/SearchBar';
import RestaurantList from '../../components/page/DiningPlace/Restaurant/RestaurantList';
import { useSearchParams } from "react-router-dom";
import { RestaurantAPI } from '../../apis/restaurantAPI';
import Pagination from '../../components/common/Pagination/Pagination';
import Restaurant from '../../components/page/DiningPlace/Restaurant/Restaurant';
import ListEmtry from '../../components/common/error/ListEmtry';
import { LoaderContext } from "../../hook/LoaderContext";

export default function DiningPlace() {
    const { setLoading } = useContext(LoaderContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [restaurant, setRestaurant] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleSearch = (kw) => {
        setSearchParams({ q: kw, page: 1 });
    };
    useEffect(() => {
        const q = searchParams.get("q") || "";
        const page = Number(searchParams.get("page")) || 1;

        setKeyword(q);
        setCurrentPage(page);

        if (q.trim() !== "") {
            setLoading(true)
            RestaurantAPI.searchRestaurant(q, page, (err, data) => {
                if (!err) {
                    setRestaurant(data.restaurants);
                    setTotalPages(data.totalPages);
                }
                setLoading(false)
            });

        } else {
            setRestaurant([]); // hoặc hiển thị tất cả tùy logic bạn muốn
        }
    }, [searchParams]);

    const handlePageChange = (page) => {
        setSearchParams({ q: keyword, page });
    };
    return (
        <div className={`grid wide ${classes.container}`}>
            <div className={classes.header}>
                <img src={Dining_img} alt="dining" />
                <div>
                    <h1 >
                        Những địa điểm ăn uống tốt nhất
                    </h1>
                    <p>
                        Tìm những địa điểm tốt nhất để thưởng thức ẩm thực địa phương đích thực. Cho dù bạn thích các quán ăn do gia đình tự quản ấm cúng, đồ ăn thép nhộn nhịp hay các nhà hàng xa xôi, chúng tôi đều có thể đáp ứng. Khám phá danh sách các địa điểm ăn uống hàng đầu được chúng tôi lựa chọn kỹ lưỡng và không bao giờ bỏ lỡ trải nghiệm ẩm thực tuyệt vời!                    </p>
                    <SearchBar defaultValue={keyword} onSearch={handleSearch} />
                </div>
            </div>
            <div className={classes.list}>
                {
                    keyword.trim() !== "" &&
                    (restaurant.length > 0 ? <>
                        <h1 className={classes.title}>
                            Kết quả tìm kiếm cho "{keyword}"
                        </h1>
                        <div className={classes.search_list}>
                            {
                                restaurant.map((e) =>
                                    <Restaurant key={e._id} data={e} />)
                            }
                        </div>
                        {
                            totalPages > 1 &&
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange} />
                        }
                    </> : <>
                        <ListEmtry error={`Not found results for: "${keyword}"`} />
                    </>)

                }

                <h1 className={classes.title}>
                    Dining Places List
                </h1>
                <RestaurantList />

            </div>
        </div>

    )
}
