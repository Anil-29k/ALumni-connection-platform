import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Navbar from './Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faComment, faShare, faBookmark } from '@fortawesome/free-solid-svg-icons';
import './Feed.css';

function Feed() {
    const [feeds, setFeeds] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [likes, setLikes] = useState({});
    const [saved, setSaved] = useState({});
    const userId = localStorage.getItem('userId'); // Assuming user ID is stored in local storage
    const [page, setPage] = useState(1); // Pagination state

    useEffect(() => {
        fetchFeeds();
    }, []);

    // Fetch initial posts
    const fetchFeeds = async () => {
        try {
            const response = await fetch(`http://localhost:5000/feed/api/posts/${userId}?_limit=5&_page=1`);
            const data = await response.json();
            setFeeds(data);
            setPage(2); // Set next page for pagination
        } catch (error) {
            console.error('Error fetching feeds:', error);
        }
    };

    // Fetch more posts for infinite scrolling
    const fetchMoreFeeds = async () => {
        try {
            const response = await fetch(`http://localhost:5000/feed/api/posts/${userId}?_limit=5&_page=${page}`);
            const data = await response.json();
            if (data.length === 0) {
                setHasMore(false); // No more data to load
            } else {
                setFeeds((prevFeeds) => [...prevFeeds, ...data]); // Append new posts
                setPage(page + 1); // Increment page for next fetch
            }
        } catch (error) {
            console.error('Error fetching more feeds:', error);
        }
    };

    // Like button functionality
    const handleLike = (id) => {
        setLikes((prevLikes) => ({
            ...prevLikes,
            [id]: !prevLikes[id]
        }));
    };

    // Save button functionality
    const handleSave = (id) => {
        setSaved((prevSaved) => ({
            ...prevSaved,
            [id]: !prevSaved[id]
        }));
    };

    // Share button functionality
    const handleShare = (id) => {
        alert(`Sharing post ${id}`);
    };

    // Comment button functionality
    const handleComment = (id) => {
        alert(`Commenting on post ${id}`);
    };

    return (
        <div className='structer'>
            <Navbar />
            <InfiniteScroll className="container-mrg"
                dataLength={feeds.length}
                next={fetchMoreFeeds}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p>No more feeds to show</p>}
            >
                {feeds.map(feed => (
                    <div className="feed" key={feed._id}>
                        <div className="feed-header">
                            {feed.createdFor ? ( // Check if post is created for a community
                                <div className="feed-community">
                                    <p>{feed.createdFor.communityName}</p>
                                    <small>Posted by {feed.createdBy.firstName} {feed.createdBy.lastName}</small>
                                </div>
                            ) : (
                                <div className="feed-user">
                                    <p>{feed.createdBy.firstName} {feed.createdBy.lastName}</p>
                                </div>
                            )}
                        </div>
                        <div className="feed-content">
                            <p>{feed.content}</p>
                            {feed.media.map((url, index) => (
                                <img key={index} src={url} alt="Feed media" className="feed-media" />
                            ))}
                        </div>
                        <div className="feed-reactions">
                            <button className="reaction-button" onClick={() => handleLike(feed._id)}>
                                <FontAwesomeIcon icon={faThumbsUp} /> {likes[feed._id] ? 'Unlike' : 'Like'}
                            </button>
                            <button className="reaction-button" onClick={() => handleComment(feed._id)}>
                                <FontAwesomeIcon icon={faComment} /> Comment
                            </button>
                            <button className="reaction-button" onClick={() => handleShare(feed._id)}>
                                <FontAwesomeIcon icon={faShare} /> Share
                            </button>
                            <button className="reaction-button" onClick={() => handleSave(feed._id)}>
                                <FontAwesomeIcon icon={faBookmark} /> {saved[feed._id] ? 'Unsave' : 'Save'}
                            </button>
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
}

export default Feed;