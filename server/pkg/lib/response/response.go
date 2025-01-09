package response

import (
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	act "server/internal/modules/actor"
	g "server/internal/modules/genre"
	r "server/internal/modules/review"
	u "server/internal/modules/user/profile"
	"strings"
	"time"
)

// Response represents the general structure of an API response
// @Description Structure for a standard API response
type Response struct {
	Status string      `json:"status" example:"success/error"`
	Error  string      `json:"error,omitempty" example:"any error"`
	Data   interface{} `json:"data,omitempty"`
}

const (
	StatusOK    = "success"
	StatusError = "error"
)

type AccessTokenData struct {
	AccessToken string `json:"access_token"`
}

type UserProfileData struct {
	Email     *string `json:"email,omitempty"`
	Login     *string `json:"login,omitempty"`
	AvatarUrl *string `json:"avatar_url"`
}

func UserProfile(user *u.UserProfile) Response {
	return Response{
		Status: StatusOK,
		Data: UserProfileData{
			Email:     user.Email,
			Login:     user.Login,
			AvatarUrl: user.AvatarUrl,
		},
	}
}

type ActorData struct {
	Id        uint       `json:"actor_id"`
	Name      *string    `json:"name,omitempty"`
	WikiUrl   *string    `json:"wiki_url,omitempty"`
	AvatarUrl *string    `json:"avatar_url"`
	CreatedAt *time.Time `json:"created_at"`
}

func Actors(actors interface{}) Response {
	switch v := actors.(type) {
	case *act.ActorDTO:
		return Response{
			Status: StatusOK,
			Data: ActorData{
				Id:        v.ActorId,
				Name:      &v.Name,
				WikiUrl:   &v.WikiUrl,
				AvatarUrl: v.AvatarUrl,
				CreatedAt: &v.CreatedAt,
			},
		}
	case []*act.ActorDTO:
		var actors []ActorData
		for _, actor := range v {
			actors = append(actors, ActorData{
				Id:        actor.ActorId,
				Name:      &actor.Name,
				WikiUrl:   &actor.WikiUrl,
				AvatarUrl: actor.AvatarUrl,
				CreatedAt: &actor.CreatedAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   actors,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

type GenreData struct {
	Id        uint       `json:"genre_id"`
	Name      *string    `json:"name,omitempty"`
	CreatedAt *time.Time `json:"created_at"`
}

func Genres(genres interface{}) Response {
	switch v := genres.(type) {
	case *g.GenreDTO:
		return Response{
			Status: StatusOK,
			Data: GenreData{
				Id:        v.GenreId,
				Name:      &v.Name,
				CreatedAt: &v.CreateAt,
			},
		}
	case []*g.GenreDTO:
		var genres []GenreData
		for _, genre := range v {
			genres = append(genres, GenreData{
				Id:        genre.GenreId,
				Name:      &genre.Name,
				CreatedAt: &genre.CreateAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   genres,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

type ReviewData struct {
	ReviewID   uint       `json:"review_id"`
	UserID     uint       `json:"user_id"`
	FilmID     uint       `json:"film_id"`
	Rating     int        `json:"rating"`
	ReviewText string     `json:"review_text"`
	CreatedAt  *time.Time `json:"created_at,omitempty"`
}

func Reviews(reviews interface{}) Response {
	switch v := reviews.(type) {
	case *r.ReviewDTO:
		return Response{
			Status: StatusOK,
			Data: ReviewData{
				ReviewID:   v.ReviewID,
				UserID:     v.UserID,
				FilmID:     v.FilmID,
				Rating:     v.Rating,
				ReviewText: v.ReviewText,
				CreatedAt:  &v.CreatedAt,
			},
		}
	case []*r.ReviewDTO:
		var reviewList []ReviewData
		for _, review := range v {
			reviewList = append(reviewList, ReviewData{
				ReviewID:   review.ReviewID,
				UserID:     review.UserID,
				FilmID:     review.FilmID,
				Rating:     review.Rating,
				ReviewText: review.ReviewText,
				CreatedAt:  &review.CreatedAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   reviewList,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

func AccessToken(token string) Response {
	return Response{
		Status: StatusOK,
		Data: AccessTokenData{
			AccessToken: token,
		},
	}
}

func OK() Response {
	return Response{
		Status: StatusOK,
	}
}

func Error(error string) Response {
	return Response{
		Status: StatusError,
		Error:  error,
	}
}

func ValidationError(err error) Response {
	var errMsgs []string

	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		for _, err := range validationErrs {
			switch err.ActualTag() {
			case "required":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is a required field", err.Field()))
			case "email":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is not a valid Email", err.Field()))
			case "login":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is not a valid Login", err.Field()))
			default:
				errMsgs = append(errMsgs, fmt.Sprintf("field %s has an invalid value", err.Field()))
			}
		}
	} else {
		errMsgs = append(errMsgs, err.Error())
	}

	return Response{
		Status: StatusError,
		Error:  strings.Join(errMsgs, ", "),
	}
}
