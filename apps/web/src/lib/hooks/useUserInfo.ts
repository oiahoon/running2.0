'use client'

import { useState, useEffect } from 'react'

interface UserInfo {
  name: string
  username: string
  email: string
  avatar: string
  githubUrl?: string
}

// Default user info - can be configured via environment variables
const DEFAULT_USER_INFO: UserInfo = {
  name: process.env.NEXT_PUBLIC_USER_NAME || 'Runner',
  username: process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'runner',
  email: process.env.NEXT_PUBLIC_USER_EMAIL || 'runner@example.com',
  avatar: process.env.NEXT_PUBLIC_USER_AVATAR || '',
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_USERNAME 
    ? `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`
    : undefined
}

export function useUserInfo(): UserInfo {
  const [userInfo, setUserInfo] = useState<UserInfo>(DEFAULT_USER_INFO)

  useEffect(() => {
    // If we have a GitHub username but no avatar, use GitHub avatar
    if (userInfo.username && userInfo.username !== 'runner' && !userInfo.avatar) {
      setUserInfo(prev => ({
        ...prev,
        avatar: '/images/default-avatar.svg', // 使用本地默认头像
        githubUrl: `https://github.com/${userInfo.username}`
      }))
    }
  }, [userInfo.username, userInfo.avatar])

  return userInfo
}

// Static function to get user info for server-side usage
export function getUserInfo(): UserInfo {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'runner'
  
  return {
    name: process.env.NEXT_PUBLIC_USER_NAME || 'Runner',
    username,
    email: process.env.NEXT_PUBLIC_USER_EMAIL || `${username}@example.com`,
    avatar: username !== 'runner' 
      ? '/images/default-avatar.svg' // 使用本地默认头像
      : process.env.NEXT_PUBLIC_USER_AVATAR || '',
    githubUrl: username !== 'runner' ? `https://github.com/${username}` : undefined
  }
}
