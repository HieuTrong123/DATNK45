import React, { useState, useContext, useEffect } from 'react'
import classes from './Blog.module.css'
import blog_img from '../../assets/blog.png';
import { useSearchParams } from "react-router-dom";
import PostList from "../../components/common/Post/PostList";
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { PostAPI } from '../../apis/postAPI';
import Pagination from '../../components/common/Pagination/Pagination';
import ListEmtry from '../../components/common/error/ListEmtry';
import PostItem from '../../components/common/Post/PostItem';
import { LoaderContext } from "../../hook/LoaderContext";

export default function Blog() {
    const { setLoading } = useContext(LoaderContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [post, setPost] = useState([]);
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
            PostAPI.searchPost(q, page, (err, data) => {
                if (!err) {
                    setPost(data.listPost);
                    setTotalPages(data.totalPages);
                }
                setLoading(false)
            });

        } else {
            setPost([]); // hoặc hiển thị tất cả tùy logic bạn muốn
        }
    }, [searchParams]);

    const handlePageChange = (page) => {
        setSearchParams({ q: keyword, page });
    };
    return (
        <div className={`grid wide `}>
            <div className={classes.header}>
                <img src={blog_img} alt="blog" />
                <div>
                    <h1 >
                        Blog & Câu chuyện ẩm thực
                    </h1>
                    <p>
                        Ngoài hương vị, hãy khám phá nền văn hóa đằng sau mỗi món ăn! Ẩm thực không chỉ là một bữa ăn, mà còn là sự phản ánh của lịch sử, văn hóa và truyền thống. Đọc các bài đăng trên blog mới nhất của chúng tôi có các câu chuyện về ẩm thực, các khuyến nghị theo mùa và các điểm nhấn lễ hội.
                    </p>
                    <SearchBar defaultValue={keyword} onSearch={handleSearch} />
                </div>
            </div>
            <div>

                {
                    keyword.trim() !== "" &&
                    (post.length > 0 ? <>
                        <h1 className={classes.title}>
                            Kết quả tìm kiếm cho "{keyword}"
                        </h1>
                        <div className={classes.search_list}>
                            {
                                post.map((e) =>
                                    <PostItem key={e._id} data={e} />)
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
                    Danh sách Blog & Câu chuyện ẩm thực
                </h1>
                <PostList />
            </div>

        </div>
    )
}
