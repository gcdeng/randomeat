import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import './Place.css';
function Place(props){
    let {
        name,
        rating,
        user_ratings_total,
        vicinity,
        opening_hours,
        photos,
        place_id
    } = props.data;
    let link = `https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place_id}`;
    let imageSrc = '';
    let style = {};
    if(photos.length>0 && photos[0].getUrl) {
        imageSrc = photos[0].getUrl();
        style.backgroundImage = `url(${imageSrc})`;
    }
    return (
        <div 
            className="Place"
            style={style}>
            <div className="wrapper">
                <div className="name">
                    <a
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer">{name}</a>
                </div>
                <div className="info">
                    <div className="rating">
                        {/* <div className="number">{rating}</div> */}
                        <div className="star-rating">
                            <div className="star-rating-top" style={{width: rating/5*100+'%'}}>
                            {[...Array(5)].map((x, i)=><FontAwesomeIcon key={i} className="icon fa-star" icon={faStar} />)}
                            </div>
                            <div className="star-rating-bottom">
                            {[...Array(5)].map((x, i)=><FontAwesomeIcon key={i} className="icon fa-star" icon={faStar} />)}
                            </div>
                        </div>
                    </div>
                    {user_ratings_total?<div>{user_ratings_total} reviews</div>:''}
                    <div>{vicinity}</div>
                    {
                        opening_hours!=={}?
                        <div style={{
                            color: opening_hours.open_now?'green':'red'
                        }}>{opening_hours.open_now? 'Open':'Closed'}</div>
                        : ''
                    }
                </div>
            </div>
            
            {/* <div className="image-wrapper">
                {imageSrc?<img src={imageSrc} alt="place_photo"/>:''}
            </div> */}
        </div>
    );
}
export default Place;