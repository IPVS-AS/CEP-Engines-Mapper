module View exposing (..)


import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Decode

import Model exposing (..)
import Update exposing (..)


view : Model -> Html Msg
view model =
  case model.route of
    Benchmarks ->
      frame <|
        div [ class "content" ]
          [ viewBenchmarks model.benchmarks
          , button [ onClick RefreshBenchmarks ]
              [ text "Refresh Benchmarks" ]
          ]

    Form ->
      frame <|
        div [ class "content" ]
          [ input [ value model.form.mqttBroker, onInput ChangeBroker ] []
          , input [ value model.form.endEventName, onInput ChangeEndEvent ] []
          , button [ onClick AddInstance ]
              [ text "Add Instance" ]
          , viewFormInstances model.form.instances
          , button [ onClick StartBenchmark ]
              [ text "Start Benchmark" ]
          ]


-- FRAME


frame : Html Msg -> Html Msg
frame content =
  div [ class "frame" ]
    [ header
    , content
    ]


header : Html Msg
header =
  div [ class "header" ]
    [ p [] [ text "CEP Benchmarking" ]
    , div [ id "menu" ]
        [ button
            [ class "pure-button"
            , onClick (ChangePage Benchmarks)
            ]
            [ text "Benchmarks" ]
        , button
            [ class "pure-button"
            , onClick (ChangePage Form)
            ]
            [ text "New Benchmark" ]
        ]
    ]


-- BENCHMARKS VIEW

viewBenchmarks : List Benchmark -> Html Msg
viewBenchmarks benchmarks =
  ul [] <|
    List.map viewBenchmark benchmarks


viewBenchmark : Benchmark -> Html Msg
viewBenchmark benchmark =
  li [] <|
    [ text benchmark.name
    , viewInstances benchmark.instances
    ]


viewInstances : List Instance -> Html Msg
viewInstances instances =
  ul [] <|
    List.map viewInstance instances


viewInstance : Instance -> Html Msg
viewInstance instance =
  li [] <|
    [ text instance.name
    , text instance.state
    , viewEvents instance.events
    ]


viewEvents : List String -> Html Msg
viewEvents events =
  ul [] <|
    List.map text events


-- FORM VIEW

viewFormInstances : List Instance -> Html Msg
viewFormInstances instances =
  ul [] <|
    List.map viewFormInstance instances

viewFormInstance : Instance -> Html Msg
viewFormInstance instance =
  li []
    [ viewInstanceEngine instance.id instance.engine
    , viewConfig instance.id instance.config
    ]

viewInstanceEngine : Int -> String -> Html Msg
viewInstanceEngine instanceId engine =
  let
    engines =
      [ "Esper"
      , "Siddhi"
      ]

    engineOption opt =
      if engine == opt then
        option [ selected True ] [ text opt ]
      else
        option [] [ text opt ]

    decode =
      Decode.map (ChangeInstanceEngine instanceId) targetValue
  in
    select [ attribute "value" engine, on "change" decode ] <|
      List.map engineOption engines


viewConfig : Int -> Config -> Html Msg
viewConfig instanceId config =
  case config of
    Esper c ->
      div []
        [ button [ onClick (AddEsperEvent instanceId) ]
            [ text "Add Event" ]
        , button [ onClick (AddEsperStatement instanceId) ]
            [ text "Add Statement" ]
        , viewEsperEvents instanceId c.events
        , viewEsperStatements instanceId c.statements
        ]

    Siddhi c ->
      div []
        [ button [ onClick (AddSiddhiEvent instanceId) ]
            [ text "Add Event" ]
        , button [ onClick (AddSiddhiQuery instanceId) ]
            [ text "Add Query" ]
        , viewSiddhiEvents instanceId c.events
        , viewSiddhiQueries instanceId c.queries
        , textarea
            [ value c.definition
            , onInput (ChangeSiddhiDefinition instanceId)
            ] []
        ]


viewEsperEvents : Int -> List EsperEvent -> Html Msg
viewEsperEvents instanceId events =
  ul [] <|
    List.map (viewEsperEvent instanceId) events


viewEsperEvent : Int -> EsperEvent -> Html Msg
viewEsperEvent instanceId event =
  li []
    [ input
        [ value event.name
        , onInput (ChangeEsperEventName instanceId event.id)
        ] []
    , viewEsperEventProperties instanceId event.id event.properties
    , button [ onClick (RemoveEsperEvent instanceId event.id) ]
        [ text "Remove Event" ]
    , button [ onClick (AddEsperEventProperty instanceId event.id) ]
        [ text "Add Event Property" ]
    ]


viewEsperEventProperties : Int -> Int -> List EsperEventProperty -> Html Msg
viewEsperEventProperties instanceId eventId properties =
  ul [] <|
    List.map (viewEsperEventProperty instanceId eventId) properties


viewEsperEventProperty : Int -> Int -> EsperEventProperty -> Html Msg
viewEsperEventProperty instanceId eventId property =
  let
    propTypes =
      [ "string"
      , "int"
      , "long"
      , "boolean"
      , "double"
      , "float"
      , "short"
      , "char"
      , "byte"
      ]

    options =
      let
        typeOption propType =
          if property.propType == propType then
            option [ selected True ] [ text propType ]
          else
            option [] [ text propType ]
      in
        List.map typeOption propTypes

    decode =
      Decode.map (ChangeEsperEventPropertyType instanceId eventId property.id) targetValue
  in
    li []
      [ fieldset [ class "pure-group" ]
          [ input
              [ value property.name
              , onInput (ChangeEsperEventPropertyName instanceId eventId property.id)
              ] []
          , select [ attribute "value" property.propType, on "change" decode ]
              options
          , button
              [ type_ "button"
              , onClick (RemoveEsperEventProperty instanceId eventId property.id)
              ] [ text "Remove Property" ]
          ]
      ]


viewEsperStatements : Int -> List EsperStatement -> Html Msg
viewEsperStatements instanceId statements =
  ul [] <|
    List.map (viewEsperStatement instanceId) statements


viewEsperStatement : Int -> EsperStatement -> Html Msg
viewEsperStatement instanceId statement =
  li []
    [ fieldset [ class "pure-group" ]
        [ input
            [ value statement.name
            , onInput (ChangeEsperStatementName instanceId statement.id)
            ] []
        , textarea
            [ value statement.query
            , onInput (ChangeEsperStatementQuery instanceId statement.id)
            ] []
        , button [ onClick (RemoveEsperStatement instanceId statement.id) ]
            [ text "Remove Statement" ]
        ]
    ]


viewSiddhiEvents : Int -> List SiddhiEvent -> Html Msg
viewSiddhiEvents instanceId events =
  ul [] <|
    List.map (viewSiddhiEvent instanceId) events


viewSiddhiEvent : Int -> SiddhiEvent -> Html Msg
viewSiddhiEvent instanceId event =
  li []
    [ input
        [ value event.name
        , onInput (ChangeSiddhiEvent instanceId event.id)
        ] []
    , button [ onClick (RemoveSiddhiEvent instanceId event.id) ]
        [ text "Remove Event" ]
    ]


viewSiddhiQueries : Int -> List SiddhiQuery -> Html Msg
viewSiddhiQueries instanceId queries =
  ul [] <|
    List.map (viewSiddhiQuery instanceId) queries


viewSiddhiQuery : Int -> SiddhiQuery -> Html Msg
viewSiddhiQuery instanceId query =
  li []
    [ input
        [ value query.name
        , onInput (ChangeSiddhiQuery instanceId query.id)
        ] []
    , button [ onClick (RemoveSiddhiQuery instanceId query.id) ]
        [ text "Remove Query" ]
    ]
