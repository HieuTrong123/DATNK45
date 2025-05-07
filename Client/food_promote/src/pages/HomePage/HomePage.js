import React, { useRef } from "react";
// import bg from "../assets/bg.jpg"
import classes from "./HomePage.module.css";
import header_img from "../../assets/header.png";
import PostList from "../../components/common/Post/PostList";
import Button from "../../components/common/Button/Button";
import Feature_img from "../../assets/feature.png";
import FoodSlide from "../../components/common/Food/FoodSlide";
import Dining_img from '../../assets/dining.png';
import blog_img from '../../assets/blog.png';
import RestaurantList from "../../components/common/Restaurant/RestaurantList";
import { Link } from "react-router-dom";
import PostListHomePage from "../../components/page/HomePage/Post/PostList";

const HomePage = () => {
    const targetRef = useRef(null);

    const handleScroll = () => {
        if (targetRef.current) {
            targetRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (
        <div className={`grid wide`}>
            <div className={`${classes.header}`}>

                <div className={`${classes.header_content}`}>
                    <h1>
                        Làm chuyến đi của bạn thêm thú vị với những món ăn địa phương.                    </h1>
                    <p>
                        Trang web của chúng tôi là hướng dẫn tuyệt vời nhất để bạn khám phá các món ăn truyền thống, những viên ngọc ẩm thực đường phố ẩn giấu và các công thức nấu ăn đích thực từ khắp khu vực. Cho dù bạn là người yêu thích ẩm thực hay là một du khách, chúng tôi sẽ đưa bạn đến gần hơn với trái tim văn hóa của chúng tôi thông qua ẩm thực.
                    </p>
                    <Button onClick={handleScroll} effect={true}>khám phá</Button>
                </div>
                <img alt='img' className={classes.header_img} src={header_img} />
            </div>

            <div ref={targetRef} className={classes.home_feature}>
                <img src={Feature_img} alt="feature" />
                <div className={classes.feature_content}>
                    <h1>
                        Món ăn địa phương đặc sắc
                    </h1>
                    <p>
                        Khám phá hương vị đặc trưng của vùng đất chúng tôi. Từ ẩm thực đường phố đến các món ăn truyền thống tinh tế.
                    </p>
                    <Link to='/local-dishes'>
                        <Button>Xem thêm</Button>
                    </Link>
                </div>
            </div>

            <div className={classes.container}>
                <FoodSlide />
                <div className={classes.dining}>
                    <div className={classes.dining_content}>
                        <h1>
                            Những địa điểm ăn uống tốt nhất
                        </h1>
                        <p>
                            Tìm những địa điểm tốt nhất để thưởng thức ẩm thực địa phương đích thực. Cho dù bạn thích các quán ăn do gia đình tự quản ấm cúng, đồ ăn thép nhộn nhịp hay các nhà hàng xa xôi, chúng tôi đều có thể đáp ứng. Khám phá danh sách các địa điểm ăn uống hàng đầu được chúng tôi lựa chọn kỹ lưỡng và không bao giờ bỏ lỡ trải nghiệm ẩm thực tuyệt vời!                        </p>
                        <Link to='/dining-places'>
                            <Button>Khám phá</Button>
                        </Link>
                    </div>
                    <img src={Dining_img} alt="dining" />
                </div>
                <RestaurantList />
                <div className={classes.blog}>
                    <img src={blog_img} alt="blog" />
                    <div className={classes.blog_content}>
                        <h1>
                            Blog & Câu chuyện ẩm thực
                        </h1>
                        <p>Ngoài hương vị, hãy khám phá nền văn hóa đằng sau mỗi món ăn! Ẩm thực không chỉ là một bữa ăn, mà còn là sự phản ánh của lịch sử, văn hóa và truyền thống. Đọc các bài đăng trên blog mới nhất của chúng tôi có các câu chuyện về ẩm thực, các khuyến nghị theo mùa và các điểm nhấn lễ hội.</p>
                        <Link to='/blogsnnews'>
                            <Button>
                                Xem thêm
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={classes.postList}>
                    <PostListHomePage />
                    {/* <PostList /> */}
                </div>
            </div>
        </div>
    );

};


export default HomePage;         