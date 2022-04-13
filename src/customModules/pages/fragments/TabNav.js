import React from 'react';
import { Link } from "react-router-dom"

const TabNav = props => {
    return (
        <div className='tabs-wrapper'>
            {
                props.tabData.map((tab, index) => {
                    return (
                        <Link key={index}
                            className={`tab ${tab.active ? 'tab-active' : ''} ${props.tabData.length === (index + 1) ? 'tab-last' : ''}`}
                            to={{ pathname: tab.pathname }}>
                            <h3>{tab.title}</h3>
                        </Link>
                    )
                })
            }
        </div>
    );
}

export default TabNav

