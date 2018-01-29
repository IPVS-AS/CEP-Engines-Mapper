module View exposing (..)


import Color exposing (Color)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Decode
import Material.Icons.Content as Content
import Svg exposing (Svg, svg)
import Svg.Attributes
import Svg.Events

import Model exposing (..)
import Update exposing (..)


view : Model -> Html Msg
view model =
  case model.route of
    Benchmarks ->
      frame <|
        div [ class "content" ] [ viewBenchmarks model.benchmarks ]

    Form ->
      frame <|
        div [ class "content" ] [ viewForm model ]

-- HELPERS

icon : List (Svg.Attribute Msg) -> (Color -> Int -> Svg Msg) -> Html Msg
icon attributes name =
  svg ([ Svg.Attributes.class "icon" ] ++ attributes) [ name Color.black 24 ]


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
    [ p [ id "title" ] [ text "CEP Benchmarking" ]
    , div [ id "menu" ]
        [ p
            [ class "button", onClick (ChangePage Benchmarks) ]
            [ text "Benchmarks" ]
        , p
            [ class "button", onClick (ChangePage Form) ]
            [ text "New Benchmark" ]
        ]
    ]


-- BENCHMARKS VIEW

viewBenchmarks : List Benchmark -> Html Msg
viewBenchmarks benchmarks =
  div [ class "page" ]
    [ div []
        [ p [] [ text "Benchmarks" ]
        , ul [] <|
            List.map viewBenchmark benchmarks
        ]
    , div []
        [ button [ onClick RefreshBenchmarks ]
            [ text "REFRESH BENCHMARKS" ]
        ]
    , div []
        [ button [ onClick RemoveBenchmarks ]
            [ text "REMOVE BENCHMARKS" ]
        ]
    ]


viewBenchmark : Benchmark -> Html Msg
viewBenchmark benchmark =
  li [] <|
    [ div [ class "field" ]
        [ div []
            [ input [ type_ "checkbox", onClick (ToggleBenchmark benchmark.name) ] []
            ]
        , div []
            [ p [] [ text benchmark.name ]
            ]
        ]
    , div [ class "list" ]
        [ ul [] <|
            List.map viewInstance benchmark.instances
        ]
    ]


viewInstance : Instance -> Html Msg
viewInstance instance =
  li [] <|
    [ p [] [ text instance.name ]
    , p [] [ text instance.state ]
    , div []
        [ ul [] <|
            List.map text instance.events
        ]
    ]


viewEvents : List String -> Html Msg
viewEvents events =
  ul [] <|
    List.map text events


-- FORM VIEW

viewForm : Model -> Html Msg
viewForm model =
  div [ class "page" ]
    [ viewFormField "MQTT broker" model.form.mqttBroker ChangeBroker
    , viewFormField "Benchmark end event" model.form.endEventName ChangeEndEvent
    , div [ id "instances" ]
        [ div [ class "row" ]
            [ div [] [ p [] [ text "Instances" ] ]
            , div [] [ button [ onClick AddInstance ] [ text "ADD INSTANCE" ] ]
            ]
        , div [ id "list" ]
            [ ul [] <|
                List.map viewFormInstance model.form.instances
            ]
        ]
    , div []
        [ button [ onClick StartBenchmark ]
            [ text "START BENCHMARK" ]
        ]
    ]


viewFormField : String -> String -> (String -> Msg) -> Html Msg
viewFormField name value change =
  div [ class "field" ]
    [ div [] [ p [] [ text name ] ]
    , div []
        [ input [ Html.Attributes.value value, onInput change ] []
        ]
    ]


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
    div [ class "field" ]
      [ div [] [ p [] [ text "Engine" ] ]
      , div []
          [ select [ attribute "value" engine, on "change" decode ] <|
              List.map engineOption engines
          ]
      ]


viewConfig : Int -> Config -> Html Msg
viewConfig instanceId config =
  case config of
    Esper c ->
      div [ class "config" ]
        [ div []
            [ div [ class "row" ]
                [ div [] [ p [] [ text "Events" ] ]
                , div []
                    [ button [ onClick (AddEsperEvent instanceId) ]
                        [ text "ADD EVENT" ]
                    ]
                ]
            , div []
                [ ul [] <|
                    List.map (viewEsperEvent instanceId) c.events
                ]
            ]
        , div []
            [ div [ class "row" ]
                [ div [] [ p [] [ text "Statements" ] ]
                , div []
                    [ button [ onClick (AddEsperStatement instanceId) ]
                        [ text "ADD STATEMENT" ]
                    ]
                ]
            , div []
                [ ul [] <|
                    List.map (viewEsperStatement instanceId) c.statements
                ]
            ]
        ]

    Siddhi c ->
      div [ class "config" ]
        [ div []
            [ div [ class "row" ]
                [ div [] [ p [] [ text "Events" ] ]
                , div []
                    [ button [ onClick (AddSiddhiEvent instanceId) ]
                        [ text "ADD EVENT" ]
                    ]
                ]
            , div []
                [ ul [] <|
                    List.map (viewSiddhiEvent instanceId) c.events
                ]
            ]
        , div []
            [ div [ class "row" ]
                [ div [] [ p [] [ text "Queries" ] ]
                , div []
                    [ button [ onClick (AddSiddhiQuery instanceId) ]
                        [ text "ADD QUERY" ]
                    ]
                ]
            , div []
                [ ul [] <|
                    List.map (viewSiddhiQuery instanceId) c.queries
                ]
            ]
        , div [] [ p [] [ text "Definition" ] ]
        , div []
            [ textarea
                [ value c.definition
                , onInput (ChangeSiddhiDefinition instanceId)
                ] []
            ]
        ]


viewEsperEvent : Int -> EsperEvent -> Html Msg
viewEsperEvent instanceId event =
  li []
    [ div [ class "field" ]
        [ div []
            [ icon [ Svg.Events.onClick (RemoveEsperEvent instanceId event.id) ] Content.clear
            ]
        , div []
            [ input
                [ value event.name
                , onInput (ChangeEsperEventName instanceId event.id)
                , placeholder "Event name"
                ] []
            ]
        ]
    , div [ class "row" ]
        [ div [] [ p [] [ text "Properties" ] ]
        , div []
            [ button [ onClick (AddEsperEventProperty instanceId event.id) ]
                [ text "ADD EVENT PROPERTY" ]
            ]
        ]
    , div []
        [ ul [] <|
            List.map (viewEsperEventProperty instanceId event.id) event.properties
        ]
    ]


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
      [ div [ class "field" ]
        [ div []
            [ icon [ Svg.Events.onClick (RemoveEsperEventProperty instanceId eventId property.id) ] Content.clear
            ]
        , div []
            [ input
                [ value property.name
                , onInput (ChangeEsperEventPropertyName instanceId eventId property.id)
                , placeholder "Property name"
                ] []
            ]
        , div []
            [ select [ attribute "value" property.propType, on "change" decode ]
                options
            ]
        ]
      ]


viewEsperStatement : Int -> EsperStatement -> Html Msg
viewEsperStatement instanceId statement =
  li []
    [ div [ class "field" ]
        [ div []
            [ icon [ Svg.Events.onClick (RemoveEsperStatement instanceId statement.id) ] Content.clear
            ]
        , div []
            [ input
                [ value statement.name
                , onInput (ChangeEsperStatementName instanceId statement.id)
                , placeholder "Statement name"
                ] []
            ]
        ]
    , div []
        [ textarea
            [ value statement.query
            , onInput (ChangeEsperStatementQuery instanceId statement.id)
            , placeholder "Statement query"
            ] []
        ]
    ]


viewSiddhiEvent : Int -> SiddhiEvent -> Html Msg
viewSiddhiEvent instanceId event =
  li []
    [ div [ class "field" ]
        [ div []
            [ icon [ Svg.Events.onClick (RemoveSiddhiEvent instanceId event.id) ] Content.clear
            ]
        , div []
            [ input
                [ value event.name
                , onInput (ChangeSiddhiEvent instanceId event.id)
                , placeholder "Event name"
                ] []
            ]
        ]
    ]


viewSiddhiQuery : Int -> SiddhiQuery -> Html Msg
viewSiddhiQuery instanceId query =
  li []
    [ div [ class "field" ]
        [ div []
            [ icon [ Svg.Events.onClick (RemoveSiddhiQuery instanceId query.id) ] Content.clear
            ]
        , div []
            [ input
                [ value query.name
                , onInput (ChangeSiddhiQuery instanceId query.id)
                , placeholder "Query name"
                ] []
            ]
        ]
    ]
