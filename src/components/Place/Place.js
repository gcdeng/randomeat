import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { Loader } from 'semantic-ui-react';
import './Place.css';
function Place(props){
    if(!props.result) {
        return (
            <div className="Place">
                <Loader active>Finding {props.type}</Loader>
            </div>
        )
    }
    if(props.result==='not found') {
        return (
            <div className="Place">
                Not found
            </div>
        )
    }
    let {
        name,
        rating,
        user_ratings_total,
        vicinity,
        opening_hours,
        photos=[],
        place_id
    } = props.result;
    let link = `https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place_id}`;
    let imageSrc = '';
    let style = {};
    if(photos.length>0 && photos[0].getUrl) {
        imageSrc = photos[0].getUrl();
        style.backgroundImage = `url(${imageSrc})`;
    } else {
        style.backgroundColor = 'rgb(12, 84, 71)';
    }
    return (
        <div className="Place">
            <div className="cover-wrapper">
                <div className="blur-background" style={style}></div>
            </div>
            <div className="content">
                <a
                className="name"
                href={link} 
                target="_blank" 
                rel="noopener noreferrer">{name}</a>
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
                        <div 
                        className={opening_hours.open_now?'green':'red'}>
                        {opening_hours.open_now? 'Open':'Closed'}
                        </div>
                        : ''
                    }
                </div>
            </div>
        </div>
    );
}
export default Place;