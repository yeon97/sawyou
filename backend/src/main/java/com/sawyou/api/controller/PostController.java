package com.sawyou.api.controller;

import com.sawyou.api.request.CommentUpdateReq;
import com.sawyou.api.request.CommentWriteReq;
import com.sawyou.api.request.PostUpdateReq;
import com.sawyou.api.request.PostWriteReq;
import com.sawyou.api.response.CommentRes;
import com.sawyou.api.service.PostService;
import com.sawyou.common.auth.SawyouUserDetails;
import com.sawyou.db.entity.Comment;
import com.sawyou.db.entity.Post;
import com.sawyou.api.response.PostRes;
import com.sawyou.db.entity.PostLike;
import io.swagger.annotations.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.List;

/**
 * 게시글, 댓글 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "게시글, 댓글 API", tags = {"Post"})
@RestController
@RequestMapping("/api/v1/post")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("")
    @ApiOperation(value = "게시글 작성", notes = "요청 값에 따라 게시글을 작성한다.")
    @ApiResponses({
            @ApiResponse(code = 201, message = "게시글 작성 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 409, message = "게시글 작성 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> writePost(@ApiIgnore Authentication authentication, @RequestBody @ApiParam(value = "게시글 작성 데이터", required = true) PostWriteReq postWrite) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        Post post = postService.writePost(postWrite.getPostContent(), userSeq);

        // 게시글이 제대로 작성되지 않았을 경우
        if (post == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("게시글 작성 실패").build());
        return ResponseEntity.status(201).body(Result.builder().status(201).message("게시글 작성 성공").build());
    }

    @GetMapping("/{postSeq}")
    @ApiOperation(value = "게시글 조회", notes = "게시글 정보를 응답한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "게시글 조회 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "찾는 게시글 없음"),
            @ApiResponse(code = 409, message = "게시글 조회 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> getPostInfo(@ApiIgnore Authentication authentication, @ApiParam(value = "조회할 게시글 일련번호", required = true) @PathVariable Long postSeq) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // postSeq 값 기준으로 게시글 찾기
        PostRes post = postService.getPostInfo(postSeq);

        // 게시글 번호에 알맞는 데이터가 없을 경우
        if (post == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("찾는 게시글 없음").build());
        // 삭제된 게시글일 경우
        if (post.isPostIsDelete())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("찾는 게시글 없음").build());

        return ResponseEntity.status(200).body(Result.builder().data(post).status(200).message("게시글 조회 성공").build());
    }

    @PatchMapping("{postSeq}")
    @ApiOperation(value = "게시글 수정", notes = "요청 값에 따라 게시글을 수정한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "게시글 수정 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 403, message = "접근 권한 없음"),
            @ApiResponse(code = 404, message = "수정할 게시글 없음"),
            @ApiResponse(code = 409, message = "게시글 수정 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> updatePost(
            @ApiIgnore Authentication authentication,
            @PathVariable Long postSeq,
            @RequestBody @ApiParam(value = "게시글 수정 데이터", required = true) PostUpdateReq postUpdate
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        // postSeq 값 기준으로 수정할 게시글 찾기
        Post oPost = postService.getPostByPostSeq(postSeq);

        // 수정할 게시글 번호에 알맞는 데이터가 없을 경우
        if (oPost == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("수정할 게시글 없음").build());
        // 삭제된 게시글일 경우
        if (oPost.isPostIsDelete())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("수정할 게시글 없음").build());
        // 토큰의 사용자와 수정할 게시글의 작성자가 다를 경우
        if (oPost.getUser().getUserSeq() != userSeq)
            return ResponseEntity.status(403).body(Result.builder().status(403).message("접근 권한 없음").build());

        // 게시글 수정
        Post post = postService.updatePost(oPost, postUpdate.getPostContent());

        // 게시글이 제대로 수정되지 않았을 경우
        if (post == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("게시글 수정 실패").build());
        return ResponseEntity.status(200).body(Result.builder().status(200).message("게시글 수정 성공").build());
    }

    @DeleteMapping("{postSeq}")
    @ApiOperation(value = "게시글 삭제", notes = "요청 값에 따라 게시글을 삭제한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "게시글 삭제 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 403, message = "접근 권한 없음"),
            @ApiResponse(code = 404, message = "삭제할 게시글 없음"),
            @ApiResponse(code = 409, message = "게시글 삭제 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> deletePost(
            @ApiIgnore Authentication authentication,
            @PathVariable Long postSeq
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        // postSeq 값 기준으로 삭제할 게시글 찾기
        Post oPost = postService.getPostByPostSeq(postSeq);

        // 삭제할 게시글 번호에 알맞는 데이터가 없을 경우
        if (oPost == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("삭제할 게시글 없음").build());
        // 이미 삭제된 게시글일 경우
        if (oPost.isPostIsDelete())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("삭제할 게시글 없음").build());
        // 토큰의 사용자와 삭제할 게시글의 작성자가 다를 경우
        if (oPost.getUser().getUserSeq() != userSeq)
            return ResponseEntity.status(403).body(Result.builder().status(403).message("접근 권한 없음").build());

        // 게시글 삭제
        Post post = postService.deletePost(oPost);

        // 게시글이 제대로 삭제되지 않았을 경우
        if (post == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("게시글 삭제 실패").build());
        return ResponseEntity.status(200).body(Result.builder().status(200).message("게시글 삭제 성공").build());
    }

    @PatchMapping("/{postSeq}/like")
    @ApiOperation(value = "게시글 좋아요", notes = "게시글에 좋아요 여부를 반영한다.")
    @ApiResponses({
            @ApiResponse(code = 204, message = "게시글 좋아요 수정 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 409, message = "게시글 좋아요 수정 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> likePost(
            @ApiIgnore Authentication authentication,
            @PathVariable Long postSeq
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        PostLike postLike = postService.likePost(userSeq, postSeq);

        // 좋아요가 제대로 반영되지 않았을 경우
        if (postLike == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("게시글 좋아요 수정 실패").build());
        return ResponseEntity.status(204).body(Result.builder().status(204).message("게시글 좋아요 수정 성공").build());
    }

    @PostMapping("/comment/{postSeq}")
    @ApiOperation(value = "댓글 작성", notes = "요청 값에 따라 댓글을 작성한다.")
    @ApiResponses({
            @ApiResponse(code = 201, message = "댓글 작성 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 409, message = "댓글 작성 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> writeComment(
            @ApiIgnore Authentication authentication,
            @PathVariable Long postSeq,
            @RequestBody @ApiParam(value = "댓글 작성 데이터", required = true) CommentWriteReq commentWrite
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        Comment comment = postService.writeComment(commentWrite.getCommentContent(), postSeq, userSeq);

        // 게시글이 제대로 작성되지 않았을 경우
        if (comment == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("댓글 작성 실패").build());
        return ResponseEntity.status(201).body(Result.builder().status(201).message("댓글 작성 성공").build());
    }

    @GetMapping("/comment/{postSeq}")
    @ApiOperation(value = "댓글 조회", notes = "댓글 정보를 응답한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "댓글 조회 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "찾는 게시글 없음"),
            @ApiResponse(code = 409, message = "댓글 조회 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> getComments(
            @ApiIgnore Authentication authentication,
            @ApiParam(value = "조회할 댓글의 게시글 일련번호", required = true) @PathVariable Long postSeq
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // postSeq 값 기준으로 댓글 조회할 게시글 찾기
        Post post = postService.getPostByPostSeq(postSeq);

        // 게시글 번호에 알맞는 데이터가 없을 경우
        if (post == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("찾는 게시글 없음").build());
        // 삭제된 게시글일 경우
        if (post.isPostIsDelete())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("찾는 게시글 없음").build());

        // postSeq 값 기준으로 게시글 찾기
        List<CommentRes> comments = postService.getComments(postSeq);

        if (comments.isEmpty()) ResponseEntity.status(409).body(Result.builder().data(comments).status(409).message("댓글 조회 실패").build());
        return ResponseEntity.status(200).body(Result.builder().data(comments).status(200).message("댓글 조회 성공").build());
    }

    @PatchMapping("/comment/{commentSeq}")
    @ApiOperation(value = "댓글 수정", notes = "요청 값에 따라 댓글을 수정한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "댓글 수정 성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 403, message = "접근 권한 없음"),
            @ApiResponse(code = 404, message = "수정할 댓글 없음"),
            @ApiResponse(code = 409, message = "댓글 수정 실패"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> updateComment(
            @ApiIgnore Authentication authentication,
            @PathVariable Long commentSeq,
            @RequestBody @ApiParam(value = "댓글 수정 데이터", required = true) CommentUpdateReq commentUpdate
    ) {
        // 인증 토큰 확인, 올바르지 않은 토큰일 경우에도 401 자동 리턴
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

        // 토큰에서 사용자의 userSeq 값 추출
        SawyouUserDetails userDetails = (SawyouUserDetails) authentication.getDetails();
        Long userSeq = userDetails.getUser().getUserSeq();

        // commentSeq 값 기준으로 수정할 댓글 찾기
        Comment oComment = postService.getCommentByCommentSeq(commentSeq);

        // 수정할 댓글 번호에 알맞는 데이터가 없을 경우
        if (oComment == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("수정할 댓글 없음").build());
        // 삭제된 댓글일 경우
        if (oComment.isCommentIsDelete())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("수정할 댓글 없음").build());
        // 토큰의 사용자와 수정할 댓글의 작성자가 다를 경우
        if (oComment.getUser().getUserSeq() != userSeq)
            return ResponseEntity.status(403).body(Result.builder().status(403).message("접근 권한 없음").build());

        // 댓글 수정
        Comment comment = postService.updateComment(oComment, commentUpdate.getCommentContent());

        // 댓글이 제대로 수정되지 않았을 경우
        if (comment == null)
            return ResponseEntity.status(409).body(Result.builder().status(409).message("댓글 수정 실패").build());
        return ResponseEntity.status(200).body(Result.builder().status(200).message("댓글 수정 성공").build());
    }

    @Data
    @AllArgsConstructor
    @Builder
    static class Result<T> {
        private T data;
        private int status;
        private String message;
    }
}
