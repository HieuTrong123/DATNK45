import React from 'react'
import classes from './Post.module.css'
import { useNavigate } from 'react-router-dom'

export default function PostItem(props) {
  const { _id, image, title, description, author, createAt, updatedAt } = props.data;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/blogsnnews/${_id}`);
  };
  return (
    <div onClick={handleClick} className={`${classes.item_container}`}>
      <div style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

      }}
        className={classes.item_img}>

      </div>
      <div className={classes.item_content}>
        <h1 className={classes.item_title}>{title}</h1>
        <div className={classes.item_author}>
          <p>

            {new Date(createAt ? createAt : updatedAt).toLocaleDateString('vi-VN')}<span>-</span>{author}
          </p>

        </div>
        <p className={classes.item_des}>
          {description}
        </p>
      </div>
    </div>
  )
}
