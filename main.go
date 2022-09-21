package main

import (
	"fmt"
	"log"
	"net/http"
	"sort"
	"github.com/rs/xid"
	"github.com/gorilla/websocket"
)

type Group struct {
	Id	  string		`json:"id"`
	Members	  []*User		`json:"members"`
}

type User struct {
	Id	  string		`json:"id"`
	Username  string		`json:"username"`
	Conn	  *websocket.Conn	`json:"conn"`
}

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize: 1024,
		WriteBufferSize: 1024,
	}

	conns = map[*websocket.Conn]bool{}
	userInfo = map[*websocket.Conn]*User{}

	groups = make([]Group, 0)

	messageTypeToHandler = map[string]func(*websocket.Conn, map[string]interface{}) {
		"login":	HandleLogin,
		"create-group":	HandleCreateGroup,
		"join-group":	HandleJoinGroup,
		"leave-group":	HandleLeaveGroup,
	}
)

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		panic(err)
	}

	fmt.Println("New client connected!")
	
	id := xid.New()
	conns[conn] = true	
	userInfo[conn] = &User{
		Id: id.String(),
		Username: "~",
		Conn: conn,
	}

	go func(conn *websocket.Conn) {
		for {
			var data map[string]interface{}
			err := conn.ReadJSON(&data)

			if err != nil {
				fmt.Println("Connection closed deleting connection", err)
				delete(conns, conn)
				delete(userInfo, conn)
				return
			}	

			messageTypeToHandler[data["what"].(string)](conn, data)
		}
	}(conn)
}

func HandleLogin(conn *websocket.Conn, data map[string]interface{}) {
	if userInfo[conn].Username == "~" {
		userInfo[conn].Username = data["username"].(string)
		fmt.Printf("User %v logged in.\n", userInfo[conn].Username)
	}
}

func HandleCreateGroup(conn *websocket.Conn, data map[string]interface{}) {
	groups = append(groups, Group{
		Id: data["id"].(string),
		Members: []*User{ userInfo[conn] },
	})
	
	conn.WriteJSON(map[string]interface{} {
		"what":	    "update-groups",
		"groups":   groups,
	})
}

func HandleJoinGroup(conn *websocket.Conn, data map[string]interface{}) {
	index := sort.Search(len(groups), func(i int) bool {
		return groups[i].Id == data["id"].(string)
	})

	if index >= len(groups) {
		return
	}

	groups[index].Members = append(groups[index].Members, userInfo[conn])

	for _, member := range groups[index].Members {
		member.Conn.WriteJSON(map[string]interface{} {
			"what":	    "update-groups",
			"groups":   groups,
		})
	}

}

func HandleLeaveGroup(conn *websocket.Conn, data map[string]interface{}) {
	index := sort.Search(len(groups), func(i int) bool {
		return groups[i].Id == data["id"].(string)
	})

	if index >= len(groups) {
		return
	}

	memberIndex := -1	
	for i := range groups[index].Members {
		if groups[index].Members[i].Id == userInfo[conn].Id {
			memberIndex = i
			break
		}
	}

	if memberIndex == -1 {
		return
	}

	groups[index].Members = append(
		groups[index].Members[:memberIndex],
		groups[index].Members[memberIndex + 1:]...
	)

	if len(groups[index].Members) == 0 {
		groups = append(groups[:index], groups[index + 1:]...)
	}

	if len(groups) == 0 {
		conn.WriteJSON(map[string]interface{} {
			"what":	    "update-groups",
			"groups":   groups,
		})
	} else {
		for _, member := range groups[index].Members {
			member.Conn.WriteJSON(map[string]interface{} {
				"what":	    "update-groups",
				"groups":   groups,
			})
		}
	}
}

func main() {
	http.HandleFunc("/chat", ChatHandler)

	fmt.Println("Server is running at ws://localhost:8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
