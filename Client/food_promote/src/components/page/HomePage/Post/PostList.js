import React, { useEffect, useState, useContext } from 'react'
import NewItem from './PostItem'
import classes from './Post.module.css'
import { LoaderContext } from "../../../../hook/LoaderContext";
import { PostAPI } from '../../../../apis/postAPI';
import { useSearchParams } from "react-router-dom";
import DataError from '../../../common/error/DataError';
import ListEmtry from '../../../common/error/ListEmtry';
// import Pagination from '../Pagination/Pagination';

export default function PostListHomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [post, setPost] = useState([]);
    const { setLoading } = useContext(LoaderContext);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

    useEffect(() => {
        // Cập nhật currentPage mỗi khi searchParams thay đổi
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);
        const fetchProfile = async () => {
            PostAPI.GetAllPost({ pageNumber: currentPage }, (err, data) => {
                if (err) {
                    setError(err.message);
                } else {
                    setPost(data.listPost);
                    setTotalPages(data.pages || 1);
                    setError(false)
                }
                setLoading(false);
            });
        }
        fetchProfile();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setSearchParams({ page });
        }
    };
    if (error) return <DataError error={error} />
    if (!post) return <ListEmtry error={"không có bài post nào"} />
    return (
        <>
            <div className={classes.list_container}>
                {post.map((e, i) => (<NewItem key={i} data={e} />))}
            </div>
            {/* {
                totalPages > 1 &&
                <Pagination currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            } */}

        </>
    )
}
