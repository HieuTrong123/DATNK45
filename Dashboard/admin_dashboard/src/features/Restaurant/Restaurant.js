import React, { useEffect, useContext, useRef, useState } from 'react'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import classes from './Restaurant.module.css'
import RestItem from '../../components/RestItem/RestItem'
import { RestaurantAPI } from '../../api/restaurantAPI'
import { useSearchParams } from "react-router-dom";
import Pagination from '../../components/Pagination/Pagination'
import EditRest from '../../components/Pages/Restaurant/EditRestaurant'
import CreateRestModal from '../../components/Pages/Restaurant/CreateRestaurant'
import { LoaderContext } from '../../hooks/LoaderContext'
import { useToast } from '../../hooks/ToastContext'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import { saveAs } from 'file-saver';

export default function Restaurant() {
    const { setLoading } = useContext(LoaderContext)
    const token = localStorage.getItem("token");
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingRest, setEditingRest] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
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
        RestaurantAPI.getAll(token, query, (err, data) => {
            if (err) {
                setError(err.message)
            }
            else {
                setRestaurants(data.restaurant)
                setTotalPages(data.pages)
            }
        })
    }, [currentPage, keyword])

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setSearchParams({ page });
        }
    };


    const handleSaveUser = (updated) => {
        setEditingRest(null);
        setLoading(true)
        RestaurantAPI.updateRestaurant(token, updated._id, updated.payload, (err, res) => {
            if (err) {
                console.error("Lỗi khi cập nhật nhà hàng:", err.message);
            } else {
                setRestaurants(prevUsers =>
                    prevUsers.map(u => u._id === res._id ? res : u)
                );
                showToast("cập nhật thông tin thành công")
            }
            setLoading(false)
        });
    };

    const handleEdit = (user) => {
        setEditingRest(user);
    };

    const handleShowCreateModal = () => {
        setShowCreateModal(true)
    }
    const handleCreateUser = (formData) => {
        setLoading(true)
        RestaurantAPI.createRestaurant(token, formData, (err, res) => {
            if (err) {
                console.error("Lỗi khi tạo người dùng:", err.message);
                showToast("tạo nhà hàng thất bại");
            } else {
                setRestaurants(prev => [res, ...prev]);
                showToast("tạo người dùng thành công");
            }
            setLoading(false)
        });
    }

    const handleDelete = (userId) => {
        setConfirmDeleteId(userId);
        setConfirmMessage("Bạn có chắc muốn xóa nhà hàng này?");
    };

    const confirmDeleteRestaurant = () => {
        if (!confirmDeleteId) return;
        setLoading(true);
        RestaurantAPI.deleteRestaurant(token, confirmDeleteId, (err, res) => {
            if (err) {
                showToast("Xóa nhà hàng thất bại");
            } else {
                setRestaurants(prev => prev.filter(u => u._id !== confirmDeleteId));
                showToast("Xóa nhà hàng thành công");
            }
            setLoading(false);
            setConfirmDeleteId(null);
        });
    };

    const handleCloseModal = () => {
        setEditingRest(null);
    };

    const handleImport = (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (!file) return;
        RestaurantAPI.importExcel(token, { file }, (err, data) => {
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
        RestaurantAPI.exportExcel(token, (err, data) => {
            if (err) {
                showToast(err.error);
            }
            else {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Restaurant.xlsx`);
            }
        })
    }
    return (
        <div>
            <div className={classes.header}>
                <h1>
                    QUẢN LÝ NHÀ HÀNG
                </h1>
                <Button onClick={handleShowCreateModal}>
                    Tạo mới
                </Button>
            </div>
            <div className={classes.container}>
                <div className={classes.container_head}>
                    <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} className={classes.inp} type='text' placeholder='Tìm kiếm nhà hàng' />
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
                <div className={classes.container_ctn}>
                    {restaurants.map(e => <RestItem key={e._id} data={e} onEdit={handleEdit} onDelete={handleDelete} />)}

                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
            {editingRest && (
                <EditRest
                    restaurant={editingRest}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}

            {showCreateModal && (
                <CreateRestModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateUser}
                />
            )}

            {confirmDeleteId && (
                <ConfirmModal
                    message={confirmMessage}
                    onConfirm={confirmDeleteRestaurant}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    )
}
