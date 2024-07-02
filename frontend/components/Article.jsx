import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import ArticlePanel from './ArticlePanel'
import styles from '../css/articleStyles.css'


export default function Article() {
    const { id } = useParams();

    const[content, setContent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get_article/' + id);
                const data = await response.json();
                setContent(data)
                console.log(data)
            } catch (error) {
                console.error('Error:', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            <h1 className={styles.headline}> hello </h1>
            <p dangerouslySetInnerHTML={{ __html: content.htmlChanges }}></p>
        </div>
    )
};