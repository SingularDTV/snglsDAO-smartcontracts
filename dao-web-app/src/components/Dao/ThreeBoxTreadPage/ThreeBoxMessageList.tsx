import * as React from "react";
import { useEffect, useState} from "react";
import { List, Empty } from 'antd';

import ThreeBoxMessageItem from './ThreeBoxMessageItem'

interface ThreeBoxMessageListProps {
  thread: any;
}

const ThreeBoxMessageList =({ thread }: ThreeBoxMessageListProps) =>{
  const [messages, setMessages] =useState(null)

  useEffect(()=>{
    thread && onGetPosts()
  }, [thread])

  const onGetPosts = async() => {
    const posts = await thread.getPosts()
    setMessages(posts)
  }

  console.log('messages', messages)

  return messages
    ? (  <List
        dataSource={messages}
        itemLayout="horizontal"
      // @ts-ignore
        renderItem={props => <ThreeBoxMessageItem key={props.postId} {...props} />}
      />)
    :(<Empty />)
}

export default ThreeBoxMessageList
