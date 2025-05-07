import React from 'react'
import classes from './RestItem.module.css'

export default function RestItem({ data, onEdit, onDelete }) {
    const { _id, name, image, province, district, ward, street } = data

    const handleEdit = () => {
        onEdit(data);
    }

    const handleDelete = () => {
        onDelete(_id);
    }

    return (
        <div className={classes.box}>
            <div style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "contain",
                backgroundPosition: "center",

            }} className={classes.avt}></div>
            <div className={classes.container}>
                <div>
                    <p className={classes.name}>{name}</p>
                    <p className={classes.address}>{street} - {ward} - {district} - {province}</p>
                </div>
                <div className={classes.icon_box}>
                    <div onClick={handleEdit} className={classes.icon_setting}>
                        <i className="fa-solid fa-pen"></i>
                    </div>
                    <div onClick={handleDelete} className={classes.icon_delete}>
                        <i className="fa-solid fa-trash"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}
