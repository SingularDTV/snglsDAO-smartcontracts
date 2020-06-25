import * as React from "react";
import { useEffect, useState, useCallback, useContext} from "react";
import { List, Skeleton } from 'antd';

import ThreeBoxMessageItem from './ThreeBoxMessageItem'

import { ThreeBoxContext } from ".";

interface ThreeBoxMessageListProps {
  thread: any;
}

const ThreeBoxMessageList =({ thread }: ThreeBoxMessageListProps) =>{

  const { currConfig } =useContext(ThreeBoxContext)

  const [messages, setMessages] =useState(null)
  const [moderators, setModerators] =useState(null)

  useEffect(()=>{
    if(thread) {
      onGetPosts()
      onGetListModerators()
      thread.onUpdate(onGetPosts)
    }
  }, [thread])

  const onGetPosts = async() => {
    const res = await thread.getPosts()
    setMessages(res)
  }

  const onGetListModerators = async() => {
    const res = await thread.listModerators()
    setModerators(res)
  }

  const handleRemoveMessage = useCallback(async (postId: string) => {
    await thread.deletePost(postId)
  }, [thread])

  return messages
    ? (  <List
        dataSource={messages}
        itemLayout="horizontal"
      // @ts-ignore
        renderItem={props => <ThreeBoxMessageItem isModerator={moderators?.some((i: string) => i === currConfig?.spaces.treads.DID) || false} key={props.postId} onRemoveMessage={handleRemoveMessage} {...props} />}
      />)
    :(<Skeleton />)
}

export default ThreeBoxMessageList
