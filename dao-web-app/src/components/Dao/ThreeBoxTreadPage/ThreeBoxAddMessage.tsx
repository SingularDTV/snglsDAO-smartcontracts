import * as React from "react";
import { useState } from "react";
import { Comment, Form, Button, Input, Skeleton } from 'antd';

import AccountImage from "../../Account/AccountImage";
import * as style from './ThreeBoxTreadPage.scss'

const { TextArea } = Input;

interface ThreeBoxAddMessageProps {
  thread: any;
  profile: any;
  currentAddress: string;
}

const ThreeBoxAddMessage =({ thread, profile, currentAddress }: ThreeBoxAddMessageProps) => {
  const [value, setValue] = useState('')
  const [isSubmitting, seIsSubmittingt] = useState(false)

  const handleChange = ({target: {value: val}}: any) => {
    setValue(val)
  };

  const handleSubmit = async () =>{
    seIsSubmittingt(true)
    try{
      await thread.post(value)
      setValue('')
    } finally {
      seIsSubmittingt(false)
    }
  }

  return (
    <div className={style.antForm}>
    <Comment
      avatar={<div className={style.photo}><AccountImage profile={profile} width={40} accountAddress={currentAddress}  /></div>}
      content={thread
        ? (
          <>
            <Form.Item>
              <TextArea rows={4} onChange={handleChange} value={value} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" className={style.antFormButton} loading={isSubmitting} disabled={isSubmitting || !value} onClick={handleSubmit} type="primary">
                Add message
              </Button>
            </Form.Item>
          </>
        )
        : (<Skeleton />)
      }
    />
    </div>
  )
}

export default ThreeBoxAddMessage
