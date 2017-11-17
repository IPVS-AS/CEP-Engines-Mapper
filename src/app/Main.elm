import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode

main : Program Never Model Msg
main =
  Html.program
    { init = (model, Cmd.none)
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none


-- MODEL

type alias Model =
  { mqttBroker : String
  , endEventName : String
  , events : List Event
  , eventId : Int
  , statements : List Statement
  , statementId : Int
  }


type alias Event =
  { id : Int
  , name : String
  , properties : List EventProperty
  , propertyId : Int
  }


type alias EventProperty =
  { id : Int
  , name : String
  , propType : String
  }


type alias Statement =
  { id : Int
  , name : String
  , query : String
  }


model : Model
model =
  { mqttBroker = "tcp://10.0.14.106:1883"
  , endEventName = "TemperatureEndEvent"
  , events = [ temperatureEvent ]
  , eventId = 1
  , statements = [ warningStatement ]
  , statementId = 1
  }


temperatureEvent : Event
temperatureEvent =
  { id = 0
  , name = "TemperatureEvent"
  , properties = [ { id = 0, name = "temperature", propType = "int" } ]
  , propertyId = 1
  }


warningStatement : Statement
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


-- UPDATE

type Msg
  = MqttBroker String
  | EndEventName String
  | AddEvent
  | AddEventProperty Int
  | AddStatement
  | RemoveEvent Int
  | RemoveEventProperty Int Int
  | RemoveStatement Int
  | UpdateEventName Int String
  | UpdateEventPropertyName Int Int String
  | UpdateEventPropertyType Int Int String
  | UpdateStatementName Int String
  | UpdateStatementQuery Int String


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    MqttBroker mqttBroker ->
      { model | mqttBroker = mqttBroker } ! []

    EndEventName endEventName ->
      { model | endEventName = endEventName } ! []

    AddEvent ->
      let
        new id =
          { id = id
          , name = ""
          , properties = []
          , propertyId = 0
          }
      in
        { model
            | eventId = model.eventId + 1
            , events = model.events ++ [ new model.eventId ]
        }
          ! []

    AddEventProperty id ->
      let
        new id =
          { id = id
          , name = ""
          , propType = "int"
          }

        addEventProp event =
          if event.id == id then
            { event
                | propertyId = event.propertyId + 1
                , properties = event.properties ++ [ new event.propertyId ]
            }
          else
            event
      in
        { model | events = List.map addEventProp model.events }
          ! []

    AddStatement ->
      let
        new id =
          { id = id
          , name = ""
          , query = ""
          }
      in
        { model
            | statementId = model.statementId + 1
            , statements = model.statements ++ [ new model.statementId ]
        }
          ! []

    RemoveEvent id ->
      let
        remove event =
          if event.id == id then
            False
          else
            True
      in
        { model | events = List.filter remove model.events }
          ! []

    RemoveEventProperty eventId propId ->
      let
        removeProp property =
          if property.id == propId then
            False
          else
            True

        remove event =
          if event.id == eventId then
            { event | properties = List.filter removeProp event.properties }
          else
            event
      in
        { model | events = List.map remove model.events }
          ! []

    RemoveStatement id ->
      let
        remove statement =
          if statement.id == id then
            False
          else
            True
      in
        { model | statements = List.filter remove model.statements }
          ! []

    UpdateEventName id name ->
      let
        updateName event =
          if event.id == id then
            { event | name = name }
          else
            event
      in
        { model | events = List.map updateName model.events }
          ! []

    UpdateEventPropertyName eventId propId name ->
      let
        updatePropName prop =
          if prop.id == propId then
            { prop | name = name }
          else
            prop

        updateEvent event =
          if event.id == eventId then
            { event | properties = List.map updatePropName event.properties }
          else
            event
      in
        { model | events = List.map updateEvent model.events }
          ! []

    UpdateEventPropertyType eventId propId propType ->
      let
        updatePropType prop =
          if prop.id == propId then
            { prop | propType = propType }
          else
            prop

        updateEvent event =
          if event.id == eventId then
            { event | properties = List.map updatePropType event.properties }
          else
            event
      in
        { model | events = List.map updateEvent model.events }
          ! []

    UpdateStatementName id name ->
      let
        updateName statement =
          if statement.id == id then
            { statement | name = name }
          else
            statement
      in
        { model | statements = List.map updateName model.statements }
          ! []

    UpdateStatementQuery id query ->
      let
        updateQuery statement =
          if statement.id == id then
            { statement | query = query }
          else
            statement
      in
        { model | statements = List.map updateQuery model.statements }
          ! []


-- VIEW

view : Model -> Html Msg
view model =
  Html.form [ class "pure-form" ]
    [ input [ value model.mqttBroker, onInput MqttBroker ] []
    , input [ value model.endEventName, onInput EndEventName ] []
    , button [ type_ "button", onClick AddEvent ] [ text "Add Event" ]
    , button [ type_ "button", onClick AddStatement ] [ text "Add Statement" ]
    , viewEvents model.events
    , viewStatements model.statements
    ]


viewEvents : List Event -> Html Msg
viewEvents events =
  ul [] <|
    List.map viewEvent events


viewEvent : Event -> Html Msg
viewEvent event =
  li []
    [ input
        [ value event.name
        , onInput (UpdateEventName event.id)
        ] []
    , viewEventProperties event.id event.properties
    , button [ type_ "button", onClick (RemoveEvent event.id) ]
        [ text "Remove Event" ]
    , button [ type_ "button", onClick (AddEventProperty event.id) ]
        [ text "Add Event Property" ]
    ]


viewEventProperties : Int -> List EventProperty -> Html Msg
viewEventProperties eventId properties =
  ul [] <|
    List.map (viewEventProperty eventId) properties


viewEventProperty : Int -> EventProperty -> Html Msg
viewEventProperty eventId property =
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
      Json.Decode.map (UpdateEventPropertyType eventId property.id) targetValue
  in
    li []
      [ fieldset [ class "pure-group" ]
          [ input
              [ value property.name
              , onInput (UpdateEventPropertyName eventId property.id)
              ] []
          , select [ attribute "value" property.propType, on "change" decode ]
              options
          , button
              [ type_ "button"
              , onClick (RemoveEventProperty eventId property.id)
              ] [ text "Remove Property" ]
          ]
      ]


viewStatements : List Statement -> Html Msg
viewStatements statements =
  ul [] <|
    List.map viewStatement statements


viewStatement : Statement -> Html Msg
viewStatement statement =
  li []
    [ fieldset [ class "pure-group" ]
        [ input
            [ value statement.name
            , onInput (UpdateStatementName statement.id)
            ] []
        , textarea
            [ value statement.query
            , onInput (UpdateStatementQuery statement.id)
            ] []
        , button [ type_ "button", onClick (RemoveStatement statement.id) ]
            [ text "Remove Statement" ]
        ]
    ]
