import * as React from "react";
import { useState } from "react";
import { Comment, Form, Button, Input, Skeleton } from 'antd';

import AccountImage from "../../Account/AccountImage";

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
    <Comment
      avatar={<AccountImage profile={profile} width={40} accountAddress={currentAddress}  />}
      content={thread
        ? (
          <>
            <Form.Item>
              <TextArea rows={4} onChange={handleChange} value={value} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" loading={isSubmitting} disabled={isSubmitting || !value} onClick={handleSubmit} type="primary">
                Add message
              </Button>
            </Form.Item>
          </>
        )
        : (<Skeleton />)
      }
    />
  )
}

export default ThreeBoxAddMessage
