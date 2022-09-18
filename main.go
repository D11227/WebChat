package main

import (
	"fmt"
	"log"
	"net/http"
	"encoding/json"
	"github.com/gorilla/websocket"
)

type Group struct {
	Id		string	`json:"id"`
	Members		[]*User	`json:"members"`
}

type User struct {
	Username	string	`json:"username"`
	InLobby		bool	`json:"inLobby"`
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
		"login": HandleLogin,
		"create-group": HandleCreateGroup,
		"join-group": HandleJoinGroup,
	}
)

func getKeyByValue(m map[*websocket.Conn]*User, user* User) *websocket.Conn {
	for key, value := range m {
		if user == value {
			return key
		}
	}
	return nil
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	
	fmt.Println("New client connected!");
	conns[conn] = true	
	userInfo[conn] = &User{
		Username: "~",
		InLobby: false,
	}

	go func(conn *websocket.Conn) {
		for {
			//var data Chat
			var data map[string]interface{}
			err := conn.ReadJSON(&data)

			if err != nil {
				fmt.Println("Connection closed deleting connection", err)
				delete(conns, conn)
				delete(userInfo, conn)
				return
			}	

			messageTypeToHandler[data["what"].(string)](conn, data);

			for eachConn := range conns {
				if err := eachConn.WriteJSON(data); err != nil {
					fmt.Printf("Could not write to connection: deleting connection\n", err)
					delete(conns, eachConn)
					delete(userInfo, eachConn)
					continue
				}
			}
		}
	}(conn)
}

func HandleLogin(conn *websocket.Conn, data map[string]interface{}) {
	if (userInfo[conn].Username == "~") {
		userInfo[conn].Username = data["username"].(string)
		fmt.Printf("User %v logged in.\n", userInfo[conn].Username)
	}
}

func HandleCreateGroup(conn *websocket.Conn, data map[string]interface{}) {
	groups = append(groups, Group{
		Id: data["id"].(string),
		Members: []*User{ userInfo[conn] },
	})

	jsonGroups, err := json.Marshal(&groups)

	if err != nil {
		panic(err)
	}

	getKeyByValue(userInfo, groups[len(groups) - 1].Members[0]).WriteJSON(map[string]interface{} {
		"what": "update-groups",
		"groups": string(jsonGroups),
	})
}

func HandleJoinGroup(conn *websocket.Conn, data map[string]interface{}) {

}

func main() {
	http.HandleFunc("/chat", ChatHandler)

	fmt.Println("Server is running at ws://localhost:8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
