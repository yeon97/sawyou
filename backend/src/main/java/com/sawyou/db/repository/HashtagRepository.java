package com.sawyou.db.repository;

import com.sawyou.db.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 해시태그 좋아요 모델 관련 디비 쿼리 생성을 위한 JPA Query Method 인터페이스 정의.
 */
@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    // hashtagName이 일치하는 데이터 찾기
    Hashtag findByHashtagNameEquals(String hashtagName);

    // keyword를 포함하는 데이터 찾기
    List<Hashtag> findByHashtagNameContains(String keyword);
}