import * as React from "react";
import { useEffect, useState} from "react";
import * as moment  from "moment";
import { getProfile } from '3box';
import { Comment, Tooltip, Avatar } from 'antd';

// import AccountImage from "../../Account/AccountImage";

interface ThreeBoxMessageListProps {
  author: string;
  timestamp: number;
  postId?: string;
  message: string;
}

const ThreeBoxMessageList =({  author, message, timestamp}: ThreeBoxMessageListProps) =>{

  const [profile, setProfile]= useState(null);

  useEffect(()=>{
    onGetProfile()
  }, [])

  const onGetProfile = async () => {
    const person = await getProfile(author)
    setProfile(person)
  }

  console.log('profile', profile)
  return profile && (<Comment
    author={profile.name}
    avatar={<Avatar style={{ verticalAlign: 'middle' }} size="large" gap={3}>
      {profile.name}
    </Avatar>}
    content={
      <p>{message}</p>
    }
    datetime={
      <Tooltip
        title={moment(timestamp * 1000)
          .subtract(0, 'days')
          .format('YYYY-MMM-DD HH:mm:ss')}
      >
          <span>
            {moment(timestamp * 1000)
              .subtract(0, 'days')
              .fromNow()}
          </span>
      </Tooltip>
    }
  />)
}

export default ThreeBoxMessageList
