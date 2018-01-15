module Update exposing (..)


import Json.Decode as Decode
import Json.Encode as Encode exposing (Value)
import WebSocket

import Model exposing (..)


type Msg
  = AddInstance
  | AddEsperEvent Int
  | AddEsperEventProperty Int Int
  | AddEsperStatement Int
  | AddSiddhiEvent Int
  | AddSiddhiQuery Int
  | RemoveEsperEvent Int Int
  | RemoveEsperEventProperty Int Int Int
  | RemoveEsperStatement Int Int
  | RemoveSiddhiEvent Int Int
  | RemoveSiddhiQuery Int Int
  | ChangeBroker String
  | ChangeEndEvent String
  | ChangeInstanceEngine Int String
  | ChangeEsperEventName Int Int String
  | ChangeEsperEventPropertyName Int Int Int String
  | ChangeEsperEventPropertyType Int Int Int String
  | ChangeEsperStatementName Int Int String
  | ChangeEsperStatementQuery Int Int String
  | ChangeSiddhiEvent Int Int String
  | ChangeSiddhiQuery Int Int String
  | ChangeSiddhiDefinition Int String
  | StartBenchmark
  | RefreshBenchmarks
  | Receive String


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    AddInstance ->
      let
        new id =
          { id = id
          , name = ""
          , state = ""
          , engine = "Esper"
          , config = emptyEsperConfig
          , events = []
          }

        change form =
          { form
              | instanceId = form.instanceId + 1
              , instances = form.instances ++ [ new form.instanceId ]
          }
      in
        { model | form = change model.form }
          ! []

    AddEsperEvent instanceId ->
      let
        new id =
          { id = id
          , name = ""
          , properties = []
          , propertyId = 0
          }

        addEvent config =
          case config of
            Esper c ->
              Esper
              { c
                  | eventId = c.eventId + 1
                  , events = c.events ++ [ new c.eventId ]
              }

            _ ->
              config
      in
        changeConfig model instanceId addEvent
          ! []

    AddEsperEventProperty instanceId eventId ->
      let
        new id =
          { id = id
          , name = ""
          , propType = "int"
          }

        addEventProp event =
          if event.id == eventId then
            { event
                | propertyId = event.propertyId + 1
                , properties = event.properties ++ [ new event.propertyId ]
            }
          else
            event

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.map addEventProp c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    AddEsperStatement instanceId ->
      let
        new id =
          { id = id
          , name = ""
          , query = ""
          }

        addStatement config =
          case config of
            Esper c ->
              Esper
              { c
                  | statementId = c.statementId + 1
                  , statements = c.statements ++ [ new c.statementId ]
              }

            _ ->
              config
      in
        changeConfig model instanceId addStatement
          ! []

    AddSiddhiEvent instanceId ->
      let
        new id =
          { id = id
          , name = ""
          }

        addEvent config =
          case config of
            Siddhi c ->
              Siddhi
              { c
                  | eventId = c.eventId + 1
                  , events = c.events ++ [ new c.eventId ]
              }

            _ ->
              config
      in
        changeConfig model instanceId addEvent
          ! []

    AddSiddhiQuery instanceId ->
      let
        new id =
          { id = id
          , name = ""
          }

        addQuery config =
          case config of
            Siddhi c ->
              Siddhi
              { c
                  | queryId = c.queryId + 1
                  , queries = c.queries ++ [ new c.queryId ]
              }

            _ ->
              config
      in
        changeConfig model instanceId addQuery
          ! []

    RemoveEsperEvent instanceId eventId ->
      let
        removeEvent event =
          if event.id == eventId then
            False
          else
            True

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.filter removeEvent c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    RemoveEsperEventProperty instanceId eventId propId ->
      let
        removeProp property =
          if property.id == propId then
            False
          else
            True

        changeEvent event =
          if event.id == eventId then
            { event | properties = List.filter removeProp event.properties }
          else
            event

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.map changeEvent c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    RemoveEsperStatement instanceId statementId ->
      let
        removeStatement statement =
          if statement.id == statementId then
            False
          else
            True

        change config =
          case config of
            Esper c ->
              Esper
              { c | statements = List.filter removeStatement c.statements }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    RemoveSiddhiEvent instanceId eventId ->
      let
        removeEvent event =
          if event.id == eventId then
            False
          else
            True

        change config =
          case config of
            Siddhi c ->
              Siddhi
              { c | events = List.filter removeEvent c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    RemoveSiddhiQuery instanceId queryId ->
      let
        removeQuery query =
          if query.id == queryId then
            False
          else
            True

        change config =
          case config of
            Siddhi c ->
              Siddhi
              { c | queries = List.filter removeQuery c.queries }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeBroker mqttBroker ->
      let
        change form =
          { form | mqttBroker = mqttBroker }
      in
        { model | form = change model.form }
          ! []

    ChangeEndEvent endEventName ->
      let
        change form =
          { form | endEventName = endEventName }
      in
        { model | form = change model.form }
          ! []

    ChangeInstanceEngine instanceId engine ->
      let
        changeEngine instance =
          if instance.id == instanceId then
            case engine of
              "Esper" ->
                { instance
                    | engine = engine
                    , config = emptyEsperConfig
                }

              "Siddhi" ->
                { instance
                    | engine = engine
                    , config = emptySiddhiConfig
                }

              _ ->
                instance
          else
            instance

        change form =
          { form | instances = List.map changeEngine form.instances}
      in
        { model | form = change model.form }
          ! []

    ChangeEsperEventName instanceId eventId name ->
      let
        changeName event =
          if event.id == eventId then
            { event | name = name }
          else
            event

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.map changeName c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeEsperEventPropertyName instanceId eventId propId name ->
      let
        changeName prop =
          if prop.id == propId then
            { prop | name = name }
          else
            prop

        changeEvent event =
          if event.id == eventId then
            { event | properties = List.map changeName event.properties }
          else
            event

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.map changeEvent c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeEsperEventPropertyType instanceId eventId propId propType ->
      let
        changeType prop =
          if prop.id == propId then
            { prop | propType = propType }
          else
            prop

        changeEvent event =
          if event.id == eventId then
            { event | properties = List.map changeType event.properties }
          else
            event

        change config =
          case config of
            Esper c ->
              Esper
              { c | events = List.map changeEvent c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeEsperStatementName instanceId statementId name ->
      let
        changeName statement =
          if statement.id == statementId then
            { statement | name = name }
          else
            statement

        change config =
          case config of
            Esper c ->
              Esper
              { c | statements = List.map changeName c.statements }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeEsperStatementQuery instanceId statementId query ->
      let
        changeQuery statement =
          if statement.id == statementId then
            { statement | query = query }
          else
            statement

        change config =
          case config of
            Esper c ->
              Esper
              { c | statements = List.map changeQuery c.statements }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeSiddhiEvent instanceId eventId name ->
      let
        changeName event =
          if event.id == eventId then
            { event | name = name }
          else
            event

        change config =
          case config of
            Siddhi c ->
              Siddhi
              { c | events = List.map changeName c.events }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeSiddhiQuery instanceId queryId name ->
      let
        changeName query =
          if query.id == queryId then
            { query | name = name }
          else
            query

        change config =
          case config of
            Siddhi c ->
              Siddhi
              { c | queries = List.map changeName c.queries }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    ChangeSiddhiDefinition instanceId definition ->
      let
        change config =
          case config of
            Siddhi c ->
              Siddhi
              { c | definition = definition }

            _ ->
              config
      in
        changeConfig model instanceId change
          ! []

    StartBenchmark ->
      { model | route = Benchmarks }
        ! [ WebSocket.send model.server (encodeSubmitFormMessage model.form) ]

    RefreshBenchmarks ->
      model
        ! [ WebSocket.send model.server encodeRefreshBenchmarksMessage ]

    Receive message ->
      case decodeMessageType message of
        "Benchmarks" ->
          case decodeBenchmarks message of
            Ok benchmarks ->
              { model | benchmarks = benchmarks }
                ! []

            _ ->
              model ! []

        _ ->
          model ! []


-- HELPERS

changeConfig : Model -> Int -> (Config -> Config) -> Model
changeConfig model instanceId change =
  let
    changeInstance instance =
      if instance.id == instanceId then
        { instance | config = change instance.config }
      else
        instance

    changeForm form =
      { form | instances = List.map changeInstance form.instances }
  in
    { model | form = changeForm model.form }

emptyEsperConfig : Config
emptyEsperConfig =
  Esper
  { events = [ temperatureEvent ]
  , eventId = 1
  , statements = [ warningStatement ]
  , statementId = 1
  }


temperatureEvent : EsperEvent
temperatureEvent =
  { id = 0
  , name = "TemperatureEvent"
  , properties = [ { id = 0, name = "temperature", propType = "int" } ]
  , propertyId = 1
  }


warningStatement : EsperStatement
warningStatement =
  { id = 0
  , name = "WarningTemperature"
  , query =
      "select * from TemperatureEvent\n" ++
      "match_recognize (\n" ++
      "measures A as temp1, B as temp2\n" ++
      "pattern (A B)\n" ++
      "define\n" ++
      "A as A.temperature > 400,\n" ++
      "B as B.temperature > 400)"
  }

emptySiddhiConfig : Config
emptySiddhiConfig =
  Siddhi
  { definition =
      "define stream TemperatureEvent (temperature int);\n" ++
      "@info(name = 'WarningTemperature')\n" ++
      "from TemperatureEvent\n" ++
      "select temperature\n" ++
      "insert into OutputStream;"
  , events = [ { id = 0, name = "TemperatureEvent" } ]
  , eventId = 1
  , queries = [ { id = 0, name = "WarningTemperature" } ]
  , queryId = 1
  }


-- ENCODE

encodeSubmitFormMessage : Benchmark -> String
encodeSubmitFormMessage form  =
  Encode.encode 0 << Encode.object <|
    [ ("type", Encode.string "SubmitForm")
    , ("broker", Encode.string form.mqttBroker)
    , ("endEventName", Encode.string form.endEventName)
    , ("instances", encodeInstances form.instances)
    ]


encodeInstances : List Instance -> Value
encodeInstances instances =
  let
    encode instance =
      Encode.object <|
        [ ("engine", Encode.string instance.engine)
        , ("config", encodeConfig instance.config)
        ]
  in
    Encode.list <|
      List.map encode instances


encodeConfig : Config -> Value
encodeConfig config =
  let
    encode =
      case config of
        Esper c ->
          [ ("events", encodeEsperEvents c.events)
          , ("statements", encodeEsperStatements c.statements)
          ]

        Siddhi c ->
          [ ("events", encodeSiddhiConfig c.events)
          , ("queries", encodeSiddhiConfig c.queries)
          , ("definition", Encode.string c.definition)
          ]
  in
    Encode.object encode


encodeEsperEvents : List EsperEvent -> Value
encodeEsperEvents events =
  let
    encode event =
      Encode.object <|
        [ ("name", Encode.string event.name)
        , ("properties", encodeEsperEventProperties event.properties)
        ]
  in
    Encode.list <|
      List.map encode events


encodeEsperEventProperties : List EsperEventProperty -> Value
encodeEsperEventProperties properties =
  let
    encode property =
      Encode.object <|
        [ ("name", Encode.string property.name)
        , ("type", Encode.string property.propType)
        ]
  in
    Encode.list <|
      List.map encode properties


encodeEsperStatements : List EsperStatement -> Value
encodeEsperStatements statements =
  let
    encode statement =
      Encode.object <|
        [ ("name", Encode.string statement.name)
        , ("query", Encode.string statement.query)
        ]
  in
    Encode.list <|
      List.map encode statements


encodeSiddhiConfig : List { id : Int, name : String } -> Value
encodeSiddhiConfig configs =
  let
    encode config =
      Encode.string config.name
  in
    Encode.list <|
      List.map encode configs


encodeRefreshBenchmarksMessage : String
encodeRefreshBenchmarksMessage =
  Encode.encode 0 << Encode.object <|
    [ ("type", Encode.string "RefreshBenchmarks")
    ]


-- DECODE

decodeMessageType : String -> String
decodeMessageType message =
  Decode.decodeString (Decode.field "type" Decode.string) message
    |> Result.withDefault ""


decodeBenchmarks : String -> Result String (List Benchmark)
decodeBenchmarks message =
  let
    decodeConfig =
      Decode.oneOf
        [ decodeEsperConfig
        , decodeSiddhiConfig
        ]

    decodeEsperConfig =
      Decode.map Esper <|
        Decode.map4 EsperConfig
          (Decode.field "events" (Decode.list decodeEsperEvent))
          (Decode.succeed 0)
          (Decode.field "statements" (Decode.list decodeEsperStatement))
          (Decode.succeed 0)

    decodeEsperEvent =
      Decode.map4 EsperEvent
        (Decode.succeed 0)
        (Decode.field "name" Decode.string)
        (Decode.field "properties" (Decode.list decodeEsperEventProperty))
        (Decode.succeed 0)

    decodeEsperEventProperty =
      Decode.map3 EsperEventProperty
        (Decode.succeed 0)
        (Decode.field "name" Decode.string)
        (Decode.field "type" Decode.string)

    decodeEsperStatement =
      Decode.map3 EsperStatement
        (Decode.succeed 0)
        (Decode.field "name" Decode.string)
        (Decode.field "query" Decode.string)

    decodeSiddhiConfig =
      Decode.map Siddhi <|
        Decode.map5 SiddhiConfig
          (Decode.field "definition" Decode.string)
          (Decode.field "events" (Decode.list decodeSiddhiEvent))
          (Decode.succeed 0)
          (Decode.field "queries" (Decode.list decodeSiddhiQuery))
          (Decode.succeed 0)

    decodeSiddhiEvent =
      Decode.map2 SiddhiEvent
        (Decode.succeed 0)
        Decode.string

    decodeSiddhiQuery =
      Decode.map2 SiddhiQuery
        (Decode.succeed 0)
        Decode.string

    decodeInstance =
      Decode.map6 Instance
        (Decode.succeed 0)
        (Decode.field "name" Decode.string)
        (Decode.field "state" Decode.string)
        (Decode.field "engine" Decode.string)
        (Decode.field "config" decodeConfig)
        (Decode.field "events" (Decode.list Decode.string))

    decodeBenchmark =
      Decode.map5 Benchmark
        (Decode.field "name" Decode.string)
        (Decode.field "broker" Decode.string)
        (Decode.field "endEventName" Decode.string)
        (Decode.field "instances" (Decode.list decodeInstance))
        (Decode.succeed 0)

    decoder =
      (Decode.field "benchmarks" (Decode.list decodeBenchmark))

  in
    Decode.decodeString decoder message
