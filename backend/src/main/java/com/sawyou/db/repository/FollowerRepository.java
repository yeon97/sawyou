package com.sawyou.db.repository;

import com.sawyou.db.entity.Follower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 팔로워 모델 관련 디비 쿼리 생성을 위한 JPA Query Method 인터페이스 정의.
 */
@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {
    // fromSeq가 같은 데이터 삭제
    void deleteByFollowerFromSeq(Long fromSeq);

    // userSeq와 같은 데이터 조회
    List<Follower> findByFollowerFromSeq(Long userSeq);
}