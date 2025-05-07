import React, { useEffect, useState, useContext, useRef } from 'react'
import classes from './Category.module.css'
import Table from '../../components/Table/Table'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import InpImage from '../../components/InpImage/InpImage'
import { CategoryAPI } from '../../api/categorieAPI'
import { LoaderContext } from '../../hooks/LoaderContext'
import { useSearchParams } from "react-router-dom";
import EditCategory from '../../components/Pages/Categories/EditCategory/EditCategory'
import Pagination from '../../components/Pagination/Pagination'
import { useToast } from '../../hooks/ToastContext'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import { saveAs } from 'file-saver';

export default function Category() {
    const { setLoading } = useContext(LoaderContext)
    const token = localStorage.getItem("token");
    const [error, setError] = useState(false);
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const { showToast } = useToast();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const fileInputRef = useRef();

    const title = [
        "id", "Tên", "Hành động"
    ]

    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);
    }, [searchParams]);

    useEffect(() => {
        const query = {
            pageNumber: currentPage,
            keyword,
        };
        CategoryAPI.getAllCategory(token, query, (err, data) => {
            if (err) {
                setError(err.message)
            } else {
                setCategories(data.categories)
                setTotalPages(data.pages)
            }

        })
    }, [keyword, currentPage])

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setSearchParams({ page });
        }
    };

    const handleCreate = () => {
        setLoading(true)
        if (!name || !image) return showToast("Vui lòng nhập đầy đủ thông tin.");
        CategoryAPI.createCategory(token, { name, image }, (err, data) => {
            if (!err) {
                setCategories([...categories, data])
                setName("");
                setImage("");
                showToast("tạo thành công")
            }
            setLoading(false)
        });
    };

    const handleDelete = (userId) => {
        setConfirmDeleteId(userId);
        setConfirmMessage("Bạn có chắc muốn xóa danh mục này?");
    };

    const confirmDeleteCategory = () => {
        if (!confirmDeleteId) return;
        setLoading(true);
        CategoryAPI.deleteCategory(token, confirmDeleteId, (err, res) => {
            if (!err) {
                setCategories((prevCategories) =>
                    prevCategories.filter((category) => category._id !== confirmDeleteId)
                );
                showToast("Xóa món ăn thành công");
            }
            else {
                showToast("Xóa món ăn thất bại");
            }
            setLoading(false);
            setConfirmDeleteId(null);
        });
    };

    const handleSaveEdit = (updatedCategory) => {
        setShowModal(false);
        setLoading(true)
        CategoryAPI.updateCategory(token, updatedCategory._id, {
            name: updatedCategory.name,
            image: updatedCategory.image
        }, (err, data) => {
            if (!err) {
                setCategories(prev =>
                    prev.map(cat => (cat._id === data._id ? data : cat)))


                setLoading(false)
                showToast("Sửa thành công");
            }


        });
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleImport = (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (!file) return;
        CategoryAPI.importExcel(token, { file }, (err, data) => {
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
        CategoryAPI.exportExcel(token, (err, data) => {
            if (err) {
                showToast(err.message);
            }
            else {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Categories.xlsx`);
            }
        })
    }
    return (
        <div>
            <h1 className={classes.title}>
                QUẢN LÝ DANH MỤC MÓN ĂN
            </h1>
            <div className={classes.container}>
                <div className={classes.inputbox}>
                    <div>
                        <p>Tên danh mục món ăn</p>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className={classes.inp} type="text" placeholder='Gõ tên' />
                    </div>
                    <div className={classes.create_content}>
                        <InpImage value={image} onChange={setImage} />
                        <Button onClick={handleCreate} className={classes.btn}>Tạo danh mục</Button>
                    </div>
                </div>

                <div className={classes.table}>
                    <div className={classes.option}>
                        <Input className={classes.inp_search} placeholder="Tìm kiếm danh mục" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
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
                    <Table content={categories} title={title} onEdit={handleEditClick} onDelete={handleDelete} />
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
            {showModal && selectedCategory && (
                <EditCategory
                    category={selectedCategory}
                    onClose={setShowModal}
                    onSave={handleSaveEdit}
                />
            )}
            {confirmDeleteId && (
                <ConfirmModal
                    message={confirmMessage}
                    onConfirm={confirmDeleteCategory}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    )
}

