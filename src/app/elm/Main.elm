import Html exposing (..)
import Set
import WebSocket

import Model exposing (..)
import View exposing (..)
import Update exposing (..)


main : Program Flags Model Msg
main =
  Html.programWithFlags
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


init : Flags -> (Model, Cmd msg)
init flags =
  { server = flags.server
  , route = Form
  , benchmarks = []
  , selected = Set.empty
  , form = form
  }
    ! []

form : Benchmark
form =
  { name = ""
  , mqttBroker = "tcp://192.168.209.190:1883"
  , endEventName = "TemperatureEndEvent"
  , instances = []
  , instanceId = 0
  }

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen model.server Receive
