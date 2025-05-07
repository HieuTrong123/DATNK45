import React, { useEffect, useRef, useState, useContext } from 'react'
import classes from './Post.module.css'
import Table from '../../components/Table/Table'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import InpImage from '../../components/InpImage/InpImage'
import ReactQuill from 'react-quill';
import { PostAPI } from '../../api/postAPI'
import PostItem from '../../components/Pages/PostItem/PostItem'
import { LoaderContext } from '../../hooks/LoaderContext'
import PostEditor from '../../components/PostEditor/PostEditor'
import { useToast } from '../../hooks/ToastContext'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import { useSearchParams } from "react-router-dom";
import Pagination from '../../components/Pagination/Pagination'
import { saveAs } from 'file-saver';

export default function Post() {
    const [totalPages, setTotalPages] = useState(1);
    const { setLoading } = useContext(LoaderContext)
    const [editingPost, setEditingPost] = useState(null);
    const token = localStorage.getItem("token");
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [error, setError] = useState(false);
    const [post, setPost] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const { showToast } = useToast();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const fileInputRef = useRef();

    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);
    }, [searchParams]);

    useEffect(() => {
        const query = {
            pageNumber: currentPage,
            keyword,
        };
        PostAPI.getAllPost(token, query, (err, data) => {
            if (err) setError(err.message)
            else {
                setPost(data.posts)
                setTotalPages(data.pages)
            }
        })
    }, [keyword, currentPage])

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setSearchParams({ page });
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setTitle(post.title);
        setDescription(post.description);
        setContent(post.content);
        setImage(post.image);
        setContent(post.content);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleDelete = (userId) => {
        setConfirmDeleteId(userId);
        setConfirmMessage("Bạn có chắc muốn xóa bài đăng này?");
    };

    const confirmDeletePost = () => {
        if (!confirmDeleteId) return;
        setLoading(true);
        PostAPI.deletePost(token, confirmDeleteId, (err, res) => {
            if (!err) {
                setPost(prev => prev.filter(p => p._id !== confirmDeleteId));

            }
        });
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setContent('');
        setImage('');
        setEditingPost(null);
    };


    const handleSubmit = () => {
        setLoading(true)
        const payload = { title, description, content, image };
        if (editingPost) {
            PostAPI.updatePost(token, editingPost._id, payload, (err, updated) => {
                if (!err) {
                    setPost(prev =>
                        prev.map(p => (p._id === updated._id ? updated : p))
                    );
                    resetForm();
                }
                setLoading(false)
                showToast("Cập nhật bài post thành công")
            });
        } else {
            PostAPI.createPost(token, payload, (err, newPost) => {
                if (!err) {
                    setPost(prev => [newPost, ...prev]);
                    resetForm();
                }
                setLoading(false)
                showToast("Tạo bài post thành công")
            });
        }
    };


    const handleImport = (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (!file) return;
        PostAPI.importExcel(token, { file }, (err, data) => {
            if (err) {
                showToast(err.message);
            }
            else {
                showToast(data.message);
            }
            setLoading(false);
        })
    }

    const handleExport = () => {
        PostAPI.exportExcel(token, (err, data) => {
            if (err) {
                showToast(err.error);
            }
            else {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Post.xlsx`);
            }
        })
    }
    return (
        <div>
            <h1 className={classes.title}>
                QUẢN LÝ BÀI POST
            </h1>
            <div className={classes.container}>
                <div className={classes.inputbox}>
                    <div>
                        <p>Tiêu đề</p>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className={classes.inp} type="text" placeholder='Nhập tiêu đề' />
                    </div>
                    <div>
                        <p>Mô tả</p>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} className={classes.inp} type="text" placeholder='Nhập mô tả' />
                    </div>
                    <div>
                        <p>Nội dung</p>
                        <PostEditor value={content} onChange={setContent} />
                    </div>

                    <InpImage value={image} onChange={(url) => setImage(url)} />
                    <div className={classes.box_btn_create}>
                        <Button onClick={handleSubmit} className={classes.btn}>{editingPost ? "Lưu thay đổi" : "Tạo bài post"}</Button>
                    </div>

                </div>
                <div>

                    <div className={classes.container_head}>
                        <Input className={classes.inp_search} placeholder="Tìm kiếm bài post" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <div className={classes.imp}>
                            <Button onClick={handleExport}>Export Excel</Button>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                ref={fileInputRef}
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                            <Button onClick={() => fileInputRef.current.click()}>Import Excel</Button>
                        </div>
                    </div>
                    <div className={classes.table}>
                        {post.map(e => <PostItem key={e._id} post={e} onEdit={handleEdit} onDelete={handleDelete} />)}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
            {confirmDeleteId && (
                <ConfirmModal
                    message={confirmMessage}
                    onConfirm={confirmDeletePost}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    )
}
