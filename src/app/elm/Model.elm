module Model exposing (..)

import Set exposing (Set)


type alias Flags =
  { server : String
  }


type alias Model =
  { server : String
  , route : Route
  , benchmarks : List Benchmark
  , refreshTimer : Int
  , selected : Set String
  , form : Benchmark
  }


type Route
  = Benchmarks
  | Form


type alias Benchmark =
  { name : String
  , mqttBroker : String
  , endEventName : String
  , instances : List Instance
  , instanceId : Int
  }


type alias Instance =
  { id : Int
  , name : String
  , state : String
  , engine : String
  , config : Config
  , events : List Event
  }


type Config
  = Esper EsperConfig
  | Siddhi SiddhiConfig


type alias EsperConfig =
  { events : List EsperEvent
  , eventId : Int
  , statements : List EsperStatement
  , statementId : Int
  }


type alias EsperEvent =
  { id : Int
  , name : String
  , properties : List EsperEventProperty
  , propertyId : Int
  }


type alias EsperEventProperty =
  { id : Int
  , name : String
  , propType : String
  }


type alias EsperStatement =
  { id : Int
  , name : String
  , query : String
  }


type alias SiddhiConfig =
  { definition : String
  , events : List SiddhiEvent
  , eventId : Int
  , queries : List SiddhiQuery
  , queryId : Int
  }


type alias SiddhiEvent =
  { id : Int
  , name : String
  }


type alias SiddhiQuery =
  { id : Int
  , name : String
  }

type alias Event =
  { name : String
  , data : String
  , timestamp : Int
  , date : String
  }
