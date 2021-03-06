import { CreateInstance } from "./index.jsx";



// 게시글 작성
export const WritePost = (data) => {
  const instance = CreateInstance();

  return new Promise((resolve, reject) => {
    instance.post(`/post`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => resolve(res))
    .catch(err => reject(err))
  })
}

// 게시글 조회
export const ReadPost = (num) => {
  const instance = CreateInstance();
  try {
    const res = instance.get(`/post/${num}`)
    return res
  } catch (error) {
    console.log(error)
  }
}

// 게시글 수정
export const ChangePost = (num, data) => {
  const instance = CreateInstance();
  try {
    const res = instance.patch(`/post/${num}`, data )
    return res
  } catch (error) {
    console.log(error)
  }
}

// 게시글 삭제
export const DeletePost = (num) => {
  const instance = CreateInstance();
  try {
    const res = instance.delete(`/post/${num}`)
    return res
  } catch (error) {
    console.log(error)
  }
}

// 게시글 좋아요
export const LikePost = (num) => {
  const instance = CreateInstance();
  try {
    const res = instance.patch(`/post/${num}/like`)
    return res
  } catch (error) {
    console.log(error)
  }
}

// 댓글 작성
export const WriteComment = (num,data) => {
  const instance = CreateInstance();
  try {
    const res = instance.post(`/post/comment/${num}/`, data)
    return res
  } catch (error) {
    console.log(error)
  }
}

export const ReadCommnet = (num) => {
  const instance = CreateInstance();
  try {
    const res = instance.get(`/post/comment/${num}/`)
    return res
  } catch (error) {
    console.log(error)
  }
}