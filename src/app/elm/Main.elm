import Html exposing (..)
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
  , form = form
  }
    ! []

form : Benchmark
form =
  { name = ""
  , mqttBroker = "tcp://10.0.14.106:1883"
  , endEventName = "TemperatureEndEvent"
  , instances = []
  , instanceId = 0
  }

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen model.server Receive
